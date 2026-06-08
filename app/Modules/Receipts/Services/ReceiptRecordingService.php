<?php

namespace App\Modules\Receipts\Services;

use App\Modules\Contracts\Models\Contract;
use App\Modules\Installments\Models\Installment;
use App\Modules\Receipts\Events\ReceiptRecorded;
use App\Modules\Receipts\Models\Receipt;
use DomainException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ReceiptRecordingService
{
    public function handle(array $payload): Receipt
    {
        return DB::connection('tenant')->transaction(function () use ($payload): Receipt {
            $existingReceipt = null;

            if (! empty($payload['idempotency_key'])) {
                $existingReceipt = Receipt::query()
                    ->where('idempotency_key', $payload['idempotency_key'])
                    ->with('allocations:id,receipt_id,installment_id,allocated_amount')
                    ->first();
            }

            if ($existingReceipt !== null) {
                return $existingReceipt;
            }

            $contract = Contract::query()
                ->select(['id', 'customer_id'])
                ->findOrFail($payload['contract_id']);

            $receipt = Receipt::query()->create([
                'contract_id' => $contract->id,
                'customer_id' => $contract->customer_id,
                'receipt_number' => $payload['receipt_number'] ?? $this->generateReceiptNumber(),
                'receipt_date' => $payload['receipt_date'],
                'amount_received' => $payload['amount_received'],
                'payment_method' => $payload['payment_method'],
                'external_reference' => $payload['external_reference'] ?? null,
                'idempotency_key' => $payload['idempotency_key'] ?? null,
                'notes' => $payload['notes'] ?? null,
                'meta' => $payload['meta'] ?? null,
            ]);

            $allocations = $this->resolveAllocations($contract->id, (int) $payload['amount_received'], collect($payload['allocations'] ?? []));

            $allocations->each(function (array $allocation) use ($receipt): void {
                /** @var Installment $installment */
                $installment = $allocation['installment'];
                $amount = $allocation['amount'];

                $receipt->allocations()->create([
                    'installment_id' => $installment->id,
                    'allocated_amount' => $amount,
                ]);

                $installment->paid_amount += $amount;
                $installment->outstanding_amount = max(0, $installment->scheduled_amount - $installment->paid_amount);
                $installment->status = $this->resolveInstallmentStatus($installment->scheduled_amount, $installment->paid_amount, $installment->due_date?->isPast());
                $installment->paid_at = $installment->outstanding_amount === 0 ? now() : null;
                $installment->save();
            });

            ReceiptRecorded::dispatch($receipt->load('allocations:id,receipt_id,installment_id,allocated_amount'));

            return $receipt->load('allocations:id,receipt_id,installment_id,allocated_amount');
        });
    }

    protected function resolveAllocations(int $contractId, int $amountReceived, Collection $requestedAllocations): Collection
    {
        if ($requestedAllocations->isNotEmpty()) {
            $installments = Installment::query()
                ->where('contract_id', $contractId)
                ->whereIn('id', $requestedAllocations->pluck('installment_id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $allocations = $requestedAllocations->map(function (array $allocation) use ($installments): array {
                $installment = $installments->get($allocation['installment_id']);

                if ($installment === null) {
                    throw new DomainException('Receipt allocation references an invalid installment.');
                }

                $amount = (int) $allocation['allocated_amount'];

                if ($amount <= 0 || $amount > $installment->outstanding_amount) {
                    throw new DomainException('Receipt allocation exceeds the outstanding installment amount.');
                }

                return [
                    'installment' => $installment,
                    'amount' => $amount,
                ];
            });

            if ($allocations->sum('amount') !== $amountReceived) {
                throw new DomainException('Receipt allocations must sum to the received amount.');
            }

            return $allocations;
        }

        $remaining = $amountReceived;

        return Installment::query()
            ->select(['id', 'contract_id', 'sequence', 'due_date', 'scheduled_amount', 'paid_amount', 'outstanding_amount', 'status'])
            ->where('contract_id', $contractId)
            ->where('outstanding_amount', '>', 0)
            ->orderBy('due_date')
            ->orderBy('sequence')
            ->lockForUpdate()
            ->get()
            ->map(function (Installment $installment) use (&$remaining): ?array {
                if ($remaining <= 0) {
                    return null;
                }

                $amount = min($remaining, (int) $installment->outstanding_amount);
                $remaining -= $amount;

                return [
                    'installment' => $installment,
                    'amount' => $amount,
                ];
            })
            ->filter()
            ->values()
            ->pipe(function (Collection $allocations) use ($remaining): Collection {
                if ($remaining > 0) {
                    throw new DomainException('Receipt amount exceeds all outstanding installments.');
                }

                return $allocations;
            });
    }

    protected function resolveInstallmentStatus(int $scheduledAmount, int $paidAmount, bool $isPastDue): string
    {
        if ($paidAmount >= $scheduledAmount) {
            return 'paid';
        }

        if ($paidAmount > 0) {
            return $isPastDue ? 'partial_overdue' : 'partial';
        }

        return $isPastDue ? 'overdue' : 'pending';
    }

    protected function generateReceiptNumber(): string
    {
        return 'RCT-'.now()->format('YmdHis').'-'.Str::upper(Str::random(6));
    }
}

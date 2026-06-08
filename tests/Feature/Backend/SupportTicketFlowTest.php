<?php

namespace Tests\Feature\Backend;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Backend\Concerns\CreatesTenantContext;
use Tests\TestCase;

class SupportTicketFlowTest extends TestCase
{
    use CreatesTenantContext;
    use RefreshDatabase;

    public function test_support_ticket_and_message_can_be_created(): void
    {
        [, $user] = $this->createTenantUserWithPermissions([
            'support.view',
            'support.manage',
        ]);

        Sanctum::actingAs($user);

        $ticketResponse = $this->withHeader('X-Tenant', 'model-town')
            ->postJson('/api/v1/app/support-tickets', [
                'created_by_user_id' => $user->id,
                'assigned_user_id' => $user->id,
                'subject' => 'Installment not visible',
                'channel' => 'portal',
                'priority' => 'high',
                'status' => 'open',
                'description' => 'Customer cannot see their latest installment.',
            ]);

        $ticketResponse->assertCreated()->assertJsonPath('data.subject', 'Installment not visible');
        $ticketId = $ticketResponse->json('data.id');

        $messageResponse = $this->withHeader('X-Tenant', 'model-town')
            ->postJson("/api/v1/app/support-tickets/{$ticketId}/messages", [
                'created_by_user_id' => $user->id,
                'message_type' => 'comment',
                'message' => 'Issue acknowledged and under review.',
            ]);

        $messageResponse->assertCreated()->assertJsonPath('data.message_type', 'comment');
    }
}

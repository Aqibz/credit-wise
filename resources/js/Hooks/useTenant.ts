import { usePage } from '@inertiajs/react';
import type { SharedPageProps } from '../Types/inertia';

export function useTenant() {
    return usePage<SharedPageProps>().props.tenant;
}

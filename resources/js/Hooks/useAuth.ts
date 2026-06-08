import { usePage } from '@inertiajs/react';
import type { SharedPageProps } from '../Types/inertia';

export function useAuth() {
    const { auth } = usePage<SharedPageProps>().props;

    return auth;
}

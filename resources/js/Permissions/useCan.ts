import { usePage } from '@inertiajs/react';
import type { SharedPageProps } from '../Types/inertia';

export function useCan() {
    const permissions = usePage<SharedPageProps>().props.auth?.permissions ?? [];

    const can = (permission: string | string[]) => {
        const required = Array.isArray(permission) ? permission : [permission];

        return required.every((item) => permissions.includes(item));
    };

    const canAny = (permission: string | string[]) => {
        const required = Array.isArray(permission) ? permission : [permission];

        return required.some((item) => permissions.includes(item));
    };

    return {
        permissions,
        can,
        canAny,
    };
}

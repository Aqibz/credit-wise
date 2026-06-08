import type { ReactNode } from 'react';
import { useCan } from './useCan';

interface CanProps {
    permission: string | string[];
    requireAll?: boolean;
    fallback?: ReactNode;
    children: ReactNode;
}

export function Can({ permission, requireAll = false, fallback = null, children }: CanProps) {
    const { can, canAny } = useCan();
    const allowed = requireAll ? can(permission) : canAny(permission);

    return <>{allowed ? children : fallback}</>;
}

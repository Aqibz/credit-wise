export type PermissionKey = string;

export interface AuthUser {
    id?: number | string | null;
    name?: string | null;
    email?: string | null;
    [key: string]: unknown;
}

export interface AuthSharedProps {
    user: AuthUser | null;
    permissions: PermissionKey[];
}

export interface TenantSharedProps {
    id: number | string | null;
    name: string | null;
    slug: string | null;
}

export interface SharedPageProps {
    auth: AuthSharedProps;
    tenant: TenantSharedProps;
    [key: string]: unknown;
}

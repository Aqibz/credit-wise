import { GenericErrorPage } from '../credit-wise/shared/ui/core/GenericErrorPage';

export default function Error({ status, requestId, path }) {
    return <GenericErrorPage status={status} requestId={requestId} path={path} />;
}

import { useMemo, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  Edit02Icon,
  MailSend01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';

import {
  useAssignRole,
  useCreateUser,
  useRevokeRole,
  useUpdateUser,
  useUserFilters,
} from '@/api/user-admin';
import { useResendInvitation } from '@/api/invitation';
import { ROUTES } from '@/routes/route-paths';
import { errorToast, successToast } from '@/lib/toast.lib';
import { Button } from '@/components/ui/button';
import {
  Can,
  ConfirmDialog,
  CsvExport,
  DataTable,
  IstTime,
  PageHeader,
  TableEmptyState,
  TablePagination,
  TableSkeleton,
} from '@/components/shared';
import { formatIst } from '@/lib/ist';
import {
  columnHelper,
  type RakeSetuColumnDef,
} from '@/components/shared/data-table.config';
import { USER_ROLE_LABELS } from '@/constants';
import type {
  AdminUser,
  AdminUserRole,
  UserRoleType,
} from '@/types/user-admin.types';

import UserFilters from './components/user-filters';
import UserRolesCell from './components/user-roles-cell';
import UserStatusBadge from './components/user-status-badge';
import InvitationStatus from './components/invitation-status';
import {
  CreateUserDialog,
  EditUserDialog,
} from './components/user-form-dialog';
import type { CreateUserFormValues, EditUserFormValues } from './schema';

const helper = columnHelper<AdminUser>();

/** Empty strings mean "unset" to the API; sending them would write a blank. */
const orUndefined = (value?: string | null) =>
  value && value.trim() !== '' ? value.trim() : undefined;

/**
 * Users & roles.
 *
 * This screen and the audit viewer exist together for one reason: they are the
 * cheapest complete proof that Phase 1's permission model works from the
 * outside. Create a user here, grant a role, revoke it — then open the audit
 * log and watch all three arrive with the correlation id of the request that
 * made them.
 */
const UsersPage = () => {
  const filters = useUserFilters();
  const { createUser, isLoading: creating } = useCreateUser();
  const { updateUser, isLoading: updating } = useUpdateUser();
  const { assignRole } = useAssignRole();
  const { revokeRole, isLoading: revoking } = useRevokeRole();
  const { resendInvitation } = useResendInvitation();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [pendingRevoke, setPendingRevoke] = useState<{
    user: AdminUser;
    grant: AdminUserRole;
  } | null>(null);

  const rows = filters.users ?? [];

  const onCreate = (values: CreateUserFormValues) =>
    createUser(
      {
        data: {
          firstName: values.firstName,
          middleName: orUndefined(values.middleName),
          lastName: values.lastName,
          email: values.email,
          phone: orUndefined(values.phone),
          role: values.role,
        },
      },
      {
        onSuccess: ({ data }) => {
          setCreateOpen(false);
          const created = data.data;

          // The send is asynchronous, so this cannot claim delivery — only
          // that the message was accepted. `queued: false` means it was not,
          // and the row records why.
          if (created.invitation?.queued === false) {
            errorToast({
              message: `User created, but the invitation to ${created.email} could not be sent. Use Resend.`,
            });
            return;
          }

          successToast({
            message: `User created. An invitation is on its way to ${created.email}.`,
          });
        },
      }
    );

  const onEdit = (values: EditUserFormValues) => {
    if (!editing) return;
    updateUser(
      {
        id: editing.id,
        data: {
          firstName: values.firstName,
          middleName: orUndefined(values.middleName) ?? null,
          lastName: values.lastName,
          phone: orUndefined(values.phone) ?? null,
          status: values.status,
        },
      },
      {
        onSuccess: () => {
          setEditing(null);
          successToast({ message: 'User updated.' });
        },
      }
    );
  };

  const onResend = (user: AdminUser) =>
    resendInvitation(
      { id: user.id },
      {
        onSuccess: ({ data }) => {
          if (data.data?.queued === false) {
            errorToast({
              message: `The invitation to ${user.email} could not be sent. Try again shortly.`,
            });
            return;
          }

          successToast({
            message: `A new invitation is on its way to ${user.email}. Any earlier link has stopped working.`,
          });
        },
      }
    );

  const onAssign = (user: AdminUser, role: UserRoleType) =>
    assignRole(
      { id: user.id, data: { role } },
      {
        onSuccess: () =>
          successToast({
            message: `${USER_ROLE_LABELS[role]} granted to ${user.fullName ?? user.email}.`,
          }),
      }
    );

  const onRevokeConfirmed = () => {
    if (!pendingRevoke) return;
    const { user, grant } = pendingRevoke;
    revokeRole(
      { id: user.id, userRoleId: grant.userRoleId },
      {
        onSuccess: () => {
          setPendingRevoke(null);
          successToast({
            message: `${USER_ROLE_LABELS[grant.name]} revoked. The grant is kept, marked revoked.`,
          });
        },
      }
    );
  };

  const columns = useMemo<RakeSetuColumnDef<AdminUser>[]>(
    () =>
      helper.columns([
        helper.accessor((row) => row.fullName ?? row.email, {
          id: 'name',
          header: 'Name',
          // Widest column, because it is the one people scan. Everything else
          // is fixed so this absorbs the slack rather than the gap between
          // "Status" and "Last login" doing it.
          meta: { className: 'w-[32%] min-w-[220px]' },
          cell: ({ row }) => (
            <div className="min-w-0">
              <p className="truncate font-medium">
                {row.original.fullName ?? '—'}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {row.original.email}
              </p>
            </div>
          ),
        }),
        helper.display({
          id: 'roles',
          header: 'Roles',
          meta: { className: 'w-[30%] min-w-[200px]' },
          cell: ({ row }) => (
            <UserRolesCell
              user={row.original}
              onAssign={onAssign}
              onRevoke={(user, grant) => setPendingRevoke({ user, grant })}
            />
          ),
        }),
        helper.accessor('status', {
          header: 'Status',
          // Narrow: the badge is short, and the invitation hint beside it is
          // both rare and allowed to wrap onto a second line. Sizing this
          // column for its widest possible content left a dead gap on every
          // row that did not have it.
          meta: { className: 'w-[14%] min-w-[130px]' },
          cell: ({ row }) => (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <UserStatusBadge status={row.original.status} />
              {!row.original.hasPassword && (
                <InvitationStatus invitation={row.original.lastInvitation} />
              )}
            </div>
          ),
        }),
        helper.accessor('lastLoginAt', {
          header: 'Last login',
          meta: { className: 'w-[16%] min-w-[150px]' },
          cell: ({ row }) => (
            <IstTime
              value={row.original.lastLoginAt}
              className="text-xs"
              emptyLabel="Never"
            />
          ),
        }),
        helper.display({
          id: 'actions',
          header: '',
          // Narrow and fixed: two icon buttons, right-aligned, and no divider
          // after it because the table's own border is already there.
          meta: { className: 'w-[92px] text-right' },
          cell: ({ row }) => (
            <Can permission="user:write">
              <div className="flex items-center justify-end gap-0.5">
                {/* Only for accounts that have never been activated. Re-sending
                    to somebody who already has a password would hand out a
                    password-setting link for a live account — the API refuses
                    it, and offering a button that 409s is worse than no button. */}
                {!row.original.hasPassword && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Re-send invitation to ${row.original.email}`}
                    title="Re-send invitation"
                    onClick={() => onResend(row.original)}
                  >
                    <HugeiconsIcon
                      icon={MailSend01Icon}
                      size={15}
                      strokeWidth={2}
                    />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${row.original.email}`}
                  onClick={() => setEditing(row.original)}
                >
                  <HugeiconsIcon icon={Edit02Icon} size={15} strokeWidth={2} />
                </Button>
              </div>
            </Can>
          ),
        }),
      ]) as RakeSetuColumnDef<AdminUser>[],
    // The mutation callbacks are stable for the life of the screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users & roles"
        description="Every account in your organization, and the roles each one holds. Creating, granting and revoking are all recorded in the audit log."
        breadcrumb={[
          { label: 'Administration', to: ROUTES.admin.dashboard },
          { label: 'Users & roles' },
        ]}
        actions={
          <>
            <CsvExport
              rows={rows}
              filename="rakesetu-users"
              columns={[
                { header: 'Name', value: (u) => u.fullName },
                { header: 'Email', value: (u) => u.email },
                {
                  header: 'Roles',
                  value: (u) =>
                    u.roles.map((r) => USER_ROLE_LABELS[r.name]).join(', '),
                },
                { header: 'Status', value: (u) => u.status },
                {
                  header: 'Last login (IST)',
                  value: (u) => formatIst(u.lastLoginAt),
                },
              ]}
            />
            <Can permission="user:write">
              <Button
                size="sm"
                onClick={() => setCreateOpen(true)}
                className="gap-1.5"
              >
                <HugeiconsIcon icon={Add01Icon} size={15} strokeWidth={2.2} />
                Add user
              </Button>
            </Can>
          </>
        }
      />

      <UserFilters
        search={filters.search}
        status={filters.status}
        role={filters.role}
        hasFilters={filters.hasFilters}
        onSearchChange={filters.onSearchChange}
        onStatusChange={filters.onStatusChange}
        onRoleChange={filters.onRoleChange}
        onClearFilters={filters.onClearFilters}
      />

      {/* The three-state list body — loading, empty, data. */}
      {filters.isLoading ? (
        <TableSkeleton columns={5} rows={6} />
      ) : rows.length === 0 ? (
        <TableEmptyState
          icon={UserGroupIcon}
          title={filters.hasFilters ? 'No matching users' : 'No users yet'}
          description={
            filters.hasFilters
              ? 'Try a different search, status or role.'
              : 'Accounts are created here — there is no public signup.'
          }
        />
      ) : (
        <>
          <DataTable columns={columns} data={rows} />
          {filters.pagination && (
            <TablePagination
              page={filters.pagination.page}
              totalPages={filters.pagination.totalPages}
              total={filters.pagination.total}
              limit={filters.pagination.limit}
              onPageChange={filters.onPageChange}
              label="users"
            />
          )}
        </>
      )}

      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        isLoading={creating}
        onSubmit={onCreate}
      />

      <EditUserDialog
        user={editing}
        onOpenChange={(open) => !open && setEditing(null)}
        isLoading={updating}
        onSubmit={onEdit}
      />

      <ConfirmDialog
        open={Boolean(pendingRevoke)}
        onOpenChange={(open) => !open && setPendingRevoke(null)}
        title="Revoke this role?"
        description={
          pendingRevoke ? (
            <>
              <strong>
                {pendingRevoke.user.fullName ?? pendingRevoke.user.email}
              </strong>{' '}
              will immediately lose everything{' '}
              {USER_ROLE_LABELS[pendingRevoke.grant.name]} grants. The grant row
              is kept and marked revoked, so the history of who could do what
              stays answerable.
            </>
          ) : undefined
        }
        confirmLabel="Revoke role"
        loading={revoking}
        loadingLabel="Revoking…"
        destructive
        onConfirm={onRevokeConfirmed}
      />
    </div>
  );
};

export default UsersPage;

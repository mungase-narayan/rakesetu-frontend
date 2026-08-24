import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { Can } from '@/components/shared';
import { renderWithProviders } from '@/test/render';

describe('<Can>', () => {
  it('renders its children when the permission is held', () => {
    renderWithProviders(
      <Can permission="charge:waive">
        <button>Waive</button>
      </Can>,
      { auth: { roles: ['commercial_officer'], permissions: ['charge:waive'] } }
    );

    expect(screen.getByRole('button', { name: 'Waive' })).toBeInTheDocument();
  });

  it('renders nothing when it is not', () => {
    renderWithProviders(
      <Can permission="charge:waive">
        <button>Waive</button>
      </Can>,
      { auth: { roles: ['freight_controller'], permissions: ['rake:allot'] } }
    );

    expect(screen.queryByRole('button', { name: 'Waive' })).toBeNull();
  });

  it('renders the fallback when one is given', () => {
    renderWithProviders(
      <Can
        permission="charge:waive"
        fallback={<p>Requires a Commercial Officer</p>}
      >
        <button>Waive</button>
      </Can>,
      { auth: { roles: ['freight_controller'], permissions: ['rake:allot'] } }
    );

    expect(screen.queryByRole('button', { name: 'Waive' })).toBeNull();
    expect(
      screen.getByText('Requires a Commercial Officer')
    ).toBeInTheDocument();
  });

  it('requires every permission by default, and any in "any" mode', () => {
    const auth = {
      roles: ['freight_controller' as const],
      permissions: ['rake:allot' as const],
    };

    const { unmount } = renderWithProviders(
      <Can permission={['rake:allot', 'charge:waive']}>
        <button>Both</button>
      </Can>,
      { auth }
    );
    expect(screen.queryByRole('button', { name: 'Both' })).toBeNull();
    unmount();

    renderWithProviders(
      <Can permission={['rake:allot', 'charge:waive']} mode="any">
        <button>Either</button>
      </Can>,
      { auth }
    );
    expect(screen.getByRole('button', { name: 'Either' })).toBeInTheDocument();
  });
});

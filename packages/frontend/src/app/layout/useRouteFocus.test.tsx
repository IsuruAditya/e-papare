import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import { useRouteFocus } from './useRouteFocus';

function Page({ title }: { title: string }): React.JSX.Element {
  return <h1 tabIndex={-1}>{title}</h1>;
}

function Shell(): React.JSX.Element {
  const mainRef = useRouteFocus<HTMLElement>();
  return (
    <>
      <Link to="/b">go-b</Link>
      <main ref={mainRef} tabIndex={-1}>
        <Routes>
          <Route path="/a" element={<Page title="Page A" />} />
          <Route path="/b" element={<Page title="Page B" />} />
        </Routes>
      </main>
    </>
  );
}

describe('useRouteFocus', () => {
  it('moves focus to the new page heading on route change (not on first render)', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/a']}>
        <Shell />
      </MemoryRouter>,
    );

    // First render must not steal focus from the top of the document.
    expect(screen.getByRole('heading', { name: 'Page A' })).not.toHaveFocus();

    await user.click(screen.getByRole('link', { name: 'go-b' }));

    expect(screen.getByRole('heading', { name: 'Page B' })).toHaveFocus();
  });
});

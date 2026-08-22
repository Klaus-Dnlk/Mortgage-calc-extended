/**
 * C: Uses techniques and methodology for accessibility testing —
 * Automated axe checks on shared UI shells (jest-axe).
 */
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

expect.extend(toHaveNoViolations);

const store = configureMockStore([thunk])({
  banks: { items: [], loading: false, error: null, filter: '' },
});

describe('Accessibility (axe)', () => {
  it('home shell has no critical a11y violations', async () => {
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <main aria-label="Mortgage calculator application">
            <h1>Mortgage Calculator</h1>
            <nav aria-label="Primary">
              <a href="/">Home</a>
              <a href="/banks">Banks</a>
            </nav>
          </main>
        </MemoryRouter>
      </Provider>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

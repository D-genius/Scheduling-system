import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../components/Login';
import { AuthProvider } from '../auth/AuthContext';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.post('*/o/token/', (req, res, ctx) => {
    return res(ctx.json({
      access_token: 'fake-token',
      refresh_token: 'fake-refresh-token'
    }));
  }),
  rest.get('*/me/', (req, res, ctx) => {
    return res(ctx.json({
      user_type: 'patient'
    }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('renders login form', () => {
  const { container } = render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );
  console.log(container.innerHTML);

  expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
});

test('handles login success', async () => {
  const { container } = render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );
  console.log(container.innerHTML);
  
  fireEvent.change(screen.getByLabelText(/Email Address/i), {
    target: { value: 'patient@example.com' }
  });
  fireEvent.change(screen.getByLabelText(/Password/i), {
    target: { value: 'password123' }
  });
  
  fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
  
  await waitFor(() => {
    expect(localStorage.getItem('access_token')).toBe('fake-token');
  });
});

test('handles login failure', async () => {
  server.use(
    rest.post('*/o/token/', (req, res, ctx) => {
      return res(ctx.status(401), ctx.json({ error: 'Invalid credentials' }));
    })
  );

  const { container } = render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );
  console.log(container.innerHTML);

  fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
  
  await waitFor(() => {
    expect(screen.getByText(/Login failed. Please try again./i)).toBeInTheDocument();
  });
});
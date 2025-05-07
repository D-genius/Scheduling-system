import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Appointments from '../components/Appointments';
import { AuthProvider } from '../auth/AuthContext';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const mockAppointments = [
  { id: 1, doctor: 'Dr. Smith', date: '2023-08-15T10:00:00' },
  { id: 2, doctor: 'Dr. Johnson', date: '2023-08-16T14:30:00' }
];

const server = setupServer(
  rest.get('*/appointments/', (req, res, ctx) => {
    return res(ctx.json(mockAppointments));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('displays appointments list', async () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <Appointments />
      </AuthProvider>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByText(/Dr. Smith/i)).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByText(/2023-08-16/i)).toBeInTheDocument();
  });
});

test('shows loading state', async () => {
  server.use(
    rest.get('*/appointments/', (req, res, ctx) => {
      return res(ctx.delay(200), ctx.json([]));
    })
  );

  render(
    <MemoryRouter>
      <AuthProvider>
        <Appointments />
      </AuthProvider>
    </MemoryRouter>
  );

  expect(screen.getByRole('progressbar')).toBeInTheDocument();
});

test('handles appointments fetch error', async () => {
  server.use(
    rest.get('*/appointments/', (req, res, ctx) => {
      return res(ctx.status(500));
    })
  );

  render(
    <MemoryRouter>
      <AuthProvider>
        <Appointments />
      </AuthProvider>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByText(/error fetching appointments/i)).toBeInTheDocument();
  });
});
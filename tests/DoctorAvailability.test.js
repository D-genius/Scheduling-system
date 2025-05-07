import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DoctorAvailability from '../components/DoctorAvailability';
import { AuthProvider } from '../auth/AuthContext';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.post('*/availability/', (req, res, ctx) => {
    return res(ctx.status(201));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('submits availability form', async () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <DoctorAvailability />
      </AuthProvider>
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/Start Time/i), {
    target: { value: '2023-08-15T09:00' }
  });
  fireEvent.change(screen.getByLabelText(/End Time/i), {
    target: { value: '2023-08-15T17:00' }
  });
  
  fireEvent.click(screen.getByRole('button', { name: /Add Availability/i }));
  
  await waitFor(() => {
    expect(screen.getByText(/Availability added successfully/i)).toBeInTheDocument();
  });
});

test('validates time inputs', async () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <DoctorAvailability />
      </AuthProvider>
    </MemoryRouter>
  );

  fireEvent.click(screen.getByRole('button', { name: /Add Availability/i }));
  
  await waitFor(() => {
    expect(screen.getByText(/Please select start and end times/i)).toBeInTheDocument();
  });
});
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DoctorList from '../components/DoctorList';
import { AuthProvider } from '../auth/AuthContext';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const mockDoctors = [
  { id: 1, name: 'Dr. Smith', specialization: 'Cardiology' },
  { id: 2, name: 'Dr. Johnson', specialization: 'Pediatrics' }
];

const server = setupServer(
  rest.get('*/doctors/', (req, res, ctx) => {
    return res(ctx.json(mockDoctors));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('displays doctors list', async () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <DoctorList />
      </AuthProvider>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByText(/Dr. Smith/i)).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByText(/Cardiology/i)).toBeInTheDocument();
  });
});

test('filters doctors by search', async () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <DoctorList />
      </AuthProvider>
    </MemoryRouter>
  );

  const searchInput = screen.getByPlaceholderText(/search doctors/i);
  fireEvent.change(searchInput, { target: { value: 'Pediatrics' } });

  await waitFor(() => {
    expect(screen.queryByText(/Dr. Smith/i)).not.toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByText(/Dr. Johnson/i)).toBeInTheDocument();
  });
});

test('handles doctor selection', async () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <DoctorList />
      </AuthProvider>
    </MemoryRouter>
  );

  fireEvent.click(screen.getByText(/Dr. Smith/i));
  
  await waitFor(() => {
    expect(window.location.pathname).toBe('/doctors/1');
  });

});
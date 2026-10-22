import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

describe('Login Component', () => {
  test('renders login form and elements correctly', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    // Check for email input
    const emailInput = screen.getByLabelText(/Email Address/i);
    expect(emailInput).toBeInTheDocument();
    
    // Check for password input
    const passwordInput = screen.getByLabelText(/^Password$/i);
    expect(passwordInput).toBeInTheDocument();
    
    // Check for submit button
    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    expect(submitButton).toBeInTheDocument();
  });

  test('shows validation error if email is invalid', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    
    // Try to submit empty form
    fireEvent.click(submitButton);
    
    // An error should be visible
    const errorMessage = await screen.findByRole('alert');
    expect(errorMessage).toHaveTextContent(/Please enter a valid email address/i);
  });
});

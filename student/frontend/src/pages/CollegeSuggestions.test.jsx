import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CollegeSuggestions from './CollegeSuggestions';

describe('CollegeSuggestions Component', () => {
  it('renders college cards successfully after fetching data', async () => {
    const mockData = [
      {
        university_name: 'Test University',
        country: 'US',
        fee: 25000,
        tier: 1,
        university_link: 'http://test.edu'
      }
    ];
    
    const mockFn = vi.fn().mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData)
      })
    );
    window.fetch = mockFn;
    globalThis.fetch = mockFn;

    render(<CollegeSuggestions />);

    // Wait for the mock data to be rendered into cards
    await waitFor(() => {
      expect(screen.getByText('Test University')).toBeInTheDocument();
    });
    
    const usaElements = screen.getAllByText('USA');
    expect(usaElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Tier 1')).toBeInTheDocument();
    expect(screen.getByText('$25,000/year')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import CollegeFinderFrame from './CollegeFinderFrame';

describe('CollegeFinderFrame Component', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders iframe successfully', () => {
    render(<CollegeFinderFrame />);
    const iframe = screen.getByTitle('College Finder ML Model');
    expect(iframe).toBeInTheDocument();
  });

  it('appends studentProfile parameters to iframe URL', () => {
    const mockProfile = {
      cgpa: 3.8,
      budget: 30000,
      country: "US"
    };
    window.localStorage.setItem('studentProfile', JSON.stringify(mockProfile));

    render(<CollegeFinderFrame />);
    const iframe = screen.getByTitle('College Finder ML Model');
    
    expect(iframe.src).toContain('cgpa=3.8');
    expect(iframe.src).toContain('budget=30000');
    expect(iframe.src).toContain('country=US');
  });
});

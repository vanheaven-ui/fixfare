import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
// Use the alias path defined in vitest.config.ts
import Home from "@/app/page"; 

describe("Home Page", () => {
  // Test 1: Verifies the main text element is rendered
  it("renders the main 'FixFare' title", () => {
    // Render the component into the virtual DOM
    render(<Home />);
    
    // Assert that the text "FixFare" is present anywhere in the document
    expect(screen.getByText("FixFare")).toBeInTheDocument();
  });

  // Test 2: Verifies the success message related to the DB connection
  it("renders the 'DB connected' status message", () => {
    render(<Home />);
    
    // Assert that the full status message is visible
    expect(screen.getByText("Phase 0 complete – DB connected.")).toBeInTheDocument();
  });

  // Test 3: Verifies the presence of the main container and its styling
  it("maintains the gradient background class on the main container", () => {
    render(<Home />);
    
    // Find the element with role 'main' (which is your <main> tag)
    const mainElement = screen.getByRole("main");
    
    // Assert it contains a specific Tailwind class for the gradient
    expect(mainElement).toHaveClass("bg-gradient-to-br");
  });
});
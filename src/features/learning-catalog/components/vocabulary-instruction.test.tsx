import { fireEvent, render, screen } from "@testing-library/react";
import { VocabularyInstruction } from "./vocabulary-instruction";
import { instructionStep } from "../test-fixtures";

describe("VocabularyInstruction database image", () => {
  it("renders the backend ImageUrl through Next.js Image", () => {
    const step = instructionStep();
    step.instruction!.vocabulary!.imageUrl = "/reviewed/vocabulary/apple.webp";
    render(<VocabularyInstruction instruction={step.instruction!} />);

    expect(screen.getByAltText("Illustration for the word apple")).toHaveAttribute(
      "src",
      "/reviewed/vocabulary/apple.webp",
    );
    expect(screen.getByRole("status", { name: "Loading Illustration for the word apple" })).toBeInTheDocument();
  });

  it("shows the image after loading", () => {
    const step = instructionStep();
    step.instruction!.vocabulary!.imageUrl = "/reviewed/vocabulary/apple.webp";
    render(<VocabularyInstruction instruction={step.instruction!} />);
    fireEvent.load(screen.getByAltText("Illustration for the word apple"));
    expect(screen.queryByRole("status", { name: "Loading Illustration for the word apple" })).not.toBeInTheDocument();
  });

  it("shows an accessible placeholder for an invalid or failed URL", () => {
    const invalid = instructionStep();
    invalid.instruction!.vocabulary!.imageUrl = "https://untrusted.example/apple.webp";
    const { rerender } = render(<VocabularyInstruction instruction={invalid.instruction!} />);
    expect(screen.getByRole("img", { name: "Illustration for the word apple. Image unavailable." })).toBeInTheDocument();

    const failed = instructionStep();
    failed.instruction!.vocabulary!.imageUrl = "/reviewed/vocabulary/apple.webp";
    rerender(<VocabularyInstruction instruction={failed.instruction!} />);
    fireEvent.error(screen.getByAltText("Illustration for the word apple"));
    expect(screen.getByRole("img", { name: "Illustration for the word apple. Image unavailable." })).toBeInTheDocument();
  });
});

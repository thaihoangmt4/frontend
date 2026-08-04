import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { VocabularyInstruction } from "./vocabulary-instruction";
import { instructionStep } from "../test-fixtures";

const { useLearningImage } = vi.hoisted(() => ({ useLearningImage: vi.fn() }));

vi.mock("../use-learning-image", () => ({ useLearningImage }));

describe("VocabularyInstruction Pixabay image", () => {
  it("ignores the backend image URL and renders the deterministic Pixabay result", () => {
    useLearningImage.mockReturnValue({
      image: {
        provider: "pixabay",
        providerImageId: 42,
        previewUrl: "https://cdn.pixabay.com/apple-preview.jpg",
        displayUrl: "https://pixabay.com/get/apple_640.jpg",
        width: 640,
        height: 480,
        tags: ["apple"],
        pageUrl: "https://pixabay.com/photos/apple-42/",
        authorName: "Author",
      },
      isLoading: false,
      isUnavailable: false,
    });
    const step = instructionStep();
    step.instruction!.vocabulary!.imageUrl = "/media/vocabulary/apple.webp";
    render(<VocabularyInstruction instruction={step.instruction!} />);

    expect(useLearningImage).toHaveBeenCalledWith("red apple fruit isolated");
    expect(screen.getByAltText("Illustration for the word apple")).toHaveAttribute(
      "src",
      "https://pixabay.com/get/apple_640.jpg",
    );
    expect(document.querySelector('[src="/media/vocabulary/apple.webp"]')).toBeNull();
    expect(screen.getByRole("link", { name: "Image from Pixabay" })).toHaveAttribute(
      "href",
      "https://pixabay.com/photos/apple-42/",
    );
  });

  it("shows a stable skeleton while Pixabay is loading", () => {
    useLearningImage.mockReturnValue({ image: null, isLoading: true, isUnavailable: false });
    render(<VocabularyInstruction instruction={instructionStep().instruction!} />);
    expect(screen.getByRole("status", { name: "Loading Illustration for the word apple" })).toBeInTheDocument();
  });

  it("shows an accessible placeholder when images are unavailable", () => {
    useLearningImage.mockReturnValue({ image: null, isLoading: false, isUnavailable: true });
    render(<VocabularyInstruction instruction={instructionStep().instruction!} />);
    expect(screen.getByRole("img", { name: "Illustration for the word apple. Image unavailable." })).toBeInTheDocument();
  });
});

"use client";

import React, { useState, useEffect, useCallback } from "react";
import api from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Layers,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Images,
  Sparkles,
  Maximize2,
  Info,
  Calendar,
} from "lucide-react";

export default function RevisionDeckPage() {
  const [decks, setDecks] = useState([]);
  const [loadingDecks, setLoadingDecks] = useState(true);
  const [error, setError] = useState(null);

  // Carousel Modal State
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [loadingCards, setLoadingCards] = useState(false);

  // Helper to construct absolute image URL
  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const rawUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
    const baseUrl = rawUrl.replace(/\/admin\/auth\/login\/?$/, "").replace(/\/+$/, "");
    return `${baseUrl}${url}`;
  };

  // 1. Fetch initial decks list
  useEffect(() => {
    const fetchDeckData = async () => {
      setLoadingDecks(true);
      setError(null);
      try {
        const response = await api.get("/api/revision-decks", {
          params: { populate: "*" },
        });
        // Strapi v4/v5 format: response.data.data
        const fetchedDecks = response.data?.data || [];
        setDecks(fetchedDecks);
      } catch (err) {
        console.error("Error fetching revision decks:", err);
        setError("Failed to load revision decks. Please try again later.");
      } finally {
        setLoadingDecks(false);
      }
    };

    fetchDeckData();
  }, []);

  // 2. Fetch specific deck details when clicked
  const handleOpenDeck = async (deck) => {
    const docId = deck.documentId || deck.id;
    setSelectedDeck(deck);
    setLoadingCards(true);
    setIsCarouselOpen(true);
    setActiveCardIndex(0);

    try {
      const response = await api.get(`/api/revision-decks/${docId}`, {
        params: { populate: "*" },
      });
      const deckDetail = response.data?.data || deck;
      setSelectedDeck(deckDetail);
      // Extract cards array from detail response
      const cardList = deckDetail.cards || deckDetail.attributes?.cards || [];
      setCards(cardList);
    } catch (err) {
      console.error("Error fetching deck cards:", err);
      // Fallback to deck cards if present in initial fetch
      const fallbackCards = deck.cards || deck.attributes?.cards || [];
      setCards(fallbackCards);
    } finally {
      setLoadingCards(false);
    }
  };

  const handleCloseCarousel = () => {
    setIsCarouselOpen(false);
    setSelectedDeck(null);
    setCards([]);
    setActiveCardIndex(0);
  };

  const handleNextSlide = useCallback(() => {
    if (cards.length === 0) return;
    setActiveCardIndex((prev) => (prev + 1) % cards.length);
  }, [cards.length]);

  const handlePrevSlide = useCallback(() => {
    if (cards.length === 0) return;
    setActiveCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
  }, [cards.length]);

  // Keyboard navigation for Carousel (Left, Right, Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isCarouselOpen) return;
      if (e.key === "ArrowRight") handleNextSlide();
      if (e.key === "ArrowLeft") handlePrevSlide();
      if (e.key === "Escape") handleCloseCarousel();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCarouselOpen, handleNextSlide, handlePrevSlide]);

  return (
    <div className="flex flex-col min-h-screen w-full max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Study Resources</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Revision Decks
          </h1>
          <p className="text-muted-foreground text-base mt-1">
            Master key concepts with visual revision flashcards and decks.
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loadingDecks && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">Loading revision decks...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loadingDecks && (
        <div className="p-6 text-center bg-destructive/10 border border-destructive/20 rounded-xl text-destructive max-w-lg mx-auto">
          <p className="font-semibold mb-2">{error}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loadingDecks && !error && decks.length === 0 && (
        <div className="p-12 text-center bg-secondary/30 rounded-2xl border border-dashed border-border max-w-md mx-auto my-12 space-y-3">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No Decks Found</h3>
          <p className="text-muted-foreground text-sm">
            There are currently no revision decks available. Please check back later!
          </p>
        </div>
      )}

      {/* Revision Decks Grid */}
      {!loadingDecks && !error && decks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => {
            const rawName = deck.Deck_name || deck.attributes?.Deck_name || "Untitled Deck";
            const formattedName = rawName.replace(/_/g, " ");
            const chapterTitle =
              deck.chapter?.Title ||
              deck.chapter?.attributes?.Title ||
              deck.attributes?.chapter?.data?.attributes?.Title ||
              null;
            const docId = deck.documentId || deck.id;

            return (
              <Card
                key={docId}
                className="group relative overflow-hidden border-border bg-card hover:border-primary/50 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer"
                onClick={() => handleOpenDeck(deck)}
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/80 to-primary/30 opacity-80 group-hover:opacity-100 transition-opacity" />
                
                <CardHeader className="pt-6 pb-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                      <Layers className="w-6 h-6" />
                    </div>
                    {chapterTitle && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground border border-border">
                        <BookOpen className="w-3 h-3 text-primary" />
                        {chapterTitle}
                      </span>
                    )}
                  </div>

                  <CardTitle className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                    {formattedName}
                  </CardTitle>

                  <CardDescription className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      Created:{" "}
                      {new Date(deck.createdAt || deck.attributes?.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 pb-6 flex items-center justify-between border-t border-border/50 mt-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium pt-3">
                    <Images className="w-4 h-4 text-primary" />
                    <span>Click to view cards</span>
                  </div>

                  <Button
                    size="sm"
                    className="mt-3 font-semibold gap-1.5 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDeck(deck);
                    }}
                  >
                    <span>View Deck</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* CAROUSEL MODAL DIALOG */}
      {/* ========================================================================= */}
      {isCarouselOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          
          <div className="relative w-full max-w-5xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h2 className="text-lg font-bold truncate text-foreground">
                    {(selectedDeck?.Deck_name || selectedDeck?.attributes?.Deck_name || "Deck").replace(/_/g, " ")}
                  </h2>
                  {selectedDeck?.chapter?.Title && (
                    <p className="text-xs text-muted-foreground truncate">
                      Chapter: {selectedDeck.chapter.Title}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {cards.length > 0 && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Card {activeCardIndex + 1} of {cards.length}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleCloseCarousel}
                  className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body - Slide View */}
            <div className="relative flex-1 bg-black/90 min-h-[350px] sm:min-h-[480px] flex items-center justify-center overflow-hidden p-4">
              
              {/* Loading Indicator for Detail Cards */}
              {loadingCards ? (
                <div className="flex flex-col items-center justify-center gap-3 text-white">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm font-medium">Loading revision cards...</p>
                </div>
              ) : cards.length === 0 ? (
                /* No Cards Found in this deck */
                <div className="flex flex-col items-center justify-center p-8 text-center text-white/80 space-y-2">
                  <Info className="w-10 h-10 text-muted-foreground" />
                  <p className="text-base font-semibold">No revision cards found in this deck.</p>
                </div>
              ) : (
                /* Active Card Image Display */
                <div className="relative w-full h-full flex items-center justify-center group">
                  <img
                    src={getImageUrl(cards[activeCardIndex]?.url)}
                    alt={cards[activeCardIndex]?.name || `Revision card ${activeCardIndex + 1}`}
                    className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-2xl transition-all duration-300 select-none"
                  />

                  {/* Image Title / Filename Overlay */}
                  {cards[activeCardIndex]?.name && (
                    <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-auto bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-medium truncate max-w-md border border-white/10">
                      {cards[activeCardIndex].name}
                    </div>
                  )}

                  {/* Previous Button */}
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    disabled={cards.length <= 1}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-primary text-white border border-white/20 hover:border-primary transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                    aria-label="Previous card"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={handleNextSlide}
                    disabled={cards.length <= 1}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-primary text-white border border-white/20 hover:border-primary transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                    aria-label="Next card"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer - Thumbnail Navigator */}
            {cards.length > 0 && !loadingCards && (
              <div className="p-3 sm:p-4 bg-card border-t border-border overflow-x-auto">
                <div className="flex items-center justify-center gap-2 min-w-max mx-auto px-2">
                  {cards.map((card, idx) => (
                    <button
                      key={card.id || idx}
                      type="button"
                      onClick={() => setActiveCardIndex(idx)}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        idx === activeCardIndex
                          ? "border-primary ring-2 ring-primary/40 scale-105"
                          : "border-border/60 opacity-60 hover:opacity-100 hover:border-primary/40"
                      }`}
                    >
                      <img
                        src={getImageUrl(card.formats?.thumbnail?.url || card.url)}
                        alt={card.name || `Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
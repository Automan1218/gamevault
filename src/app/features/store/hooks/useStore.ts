"use client";
import { useState, useEffect } from "react";
import { gameApi } from "../services/gameApi";
import type { GameDTO } from "@/lib/api/StoreTypes";

export function useStore(initialQuery?: string) {
  const [games, setGames] = useState<GameDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialQuery ?? "");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await gameApi.getGames();
      setGames(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchByQuery = async (q: string) => {
    setLoading(true);
    try {
      const data = await gameApi.searchGames(q);
      setGames(data);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    const q = (initialQuery ?? "").trim();
    if (q) {
      fetchByQuery(q);
    } else {
      fetchAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When query changes, call backend search or load all
  useEffect(() => {
    const q = searchQuery.trim();
    if (q) {
      fetchByQuery(q);
    } else {
      fetchAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  return { games, loading, searchQuery, setSearchQuery };
}

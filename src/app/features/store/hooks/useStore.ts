"use client";
import { useState, useEffect } from "react";
import { storeApi } from "../sevices/storeApi";
import type { GameDTO } from "@/lib/api/StoreTypes";

export function useStore() {
  const [games, setGames] = useState<GameDTO[]>([]);
  const [filteredGames, setFilteredGames] = useState<GameDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchGames = async () => {
    setLoading(true);
    try {
      const data = await storeApi.getAllGames();
      setGames(data);
      setFilteredGames(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    setFilteredGames(
      games.filter((g) => g.title.toLowerCase().includes(q))
    );
  }, [searchQuery, games]);

  return { games, filteredGames, loading, searchQuery, setSearchQuery };
}

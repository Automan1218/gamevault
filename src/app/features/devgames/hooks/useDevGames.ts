"use client";

import { useEffect, useState } from "react";
import { App } from "antd";
import { devgamesApi } from "@/app/features/devgames/services/devgamesApi";
import { DevGame } from "@/app/features/devgames/types/devGameTypes";
import { Dayjs } from "dayjs";

export interface UploadFormValues {
    name: string;
    description?: string;
    releaseDate?: Dayjs;
    image?: { originFileObj: File }[];
    video?: { originFileObj: File }[];
    zip?: { originFileObj: File }[];
}

export function useDevGames() {
    const { message } = App.useApp();
    const [games, setGames] = useState<DevGame[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadGame = async (values: UploadFormValues, resetForm?: () => void) => {
        try {
            const request = {
                name: values.name,
                description: values.description ?? "",
                releaseDate: values.releaseDate
                    ? values.releaseDate.toISOString()
                    : new Date().toISOString(),
                image: values.image?.[0]?.originFileObj as File,
                video: values.video?.[0]?.originFileObj as File | undefined,
                zip: values.zip?.[0]?.originFileObj as File,
            };

            await devgamesApi.upload(request);
            void message.success("Game uploaded successfully");
            resetForm?.();
            await fetchMyGames();
        } catch (e) {
            void message.error(e instanceof Error ? e.message : "Upload failed");
        }
    };

    const fetchMyGames = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await devgamesApi.getMyGames();
            setGames(data);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "Failed to fetch games");
        } finally {
            setLoading(false);
        }
    };

    const deleteGame = async (id: string) => {
        try {
            console.log("Calling delete API for:", id);
            await devgamesApi.deleteGame(id);
            void message.success("Game deleted successfully");
            setGames((prev) => prev.filter((g) => g.id !== id));
        } catch (e) {
            console.error("Delete failed:", e);
            void message.error(e instanceof Error ? e.message : "Failed to delete game");
        }
    };

    const updateGame = async (id: string, values: UploadFormValues, onSuccess?: () => void) => {
        try {
            const formData = new FormData();

            formData.append("name", values.name);
            formData.append("description", values.description ?? "");
            formData.append(
                "releaseDate",
                values.releaseDate ? values.releaseDate.toISOString() : new Date().toISOString()
            );

            // ✅ Optional files
            if (values.image?.[0]?.originFileObj) {
                formData.append("image", values.image[0].originFileObj as File);
            }
            if (values.video?.[0]?.originFileObj) {
                formData.append("video", values.video[0].originFileObj as File);
            }
            if (values.zip?.[0]?.originFileObj) {
                formData.append("zip", values.zip[0].originFileObj as File);
            }

            await devgamesApi.updateGame(id, formData);
            message.success("Game updated successfully");
            onSuccess?.();

            // If you want to auto-refresh MyGames
            await fetchMyGames?.();
        } catch (e) {
            message.error(e instanceof Error ? e.message : "Update failed");
        }
    };


    useEffect(() => {
        fetchMyGames();
    }, []);

    return { games, loading, error, uploadGame, deleteGame, updateGame, fetchMyGames };
}

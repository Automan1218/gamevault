"use client";

import { App } from "antd";
import { devgamesApi } from "@/app/features/devgames/services/devgamesApi";
import { Dayjs } from "dayjs";

// 🔹 定义表单值类型（可重用）
export interface UploadFormValues {
    name: string;
    description?: string;
    releaseDate?: Dayjs;
    image?: { originFileObj: File }[];
    video?: { originFileObj: File }[];
    zip?: { originFileObj: File }[];
}

// 🔹 Hook 主体
export function useDevGames() {
    const { message } = App.useApp();

    const uploadGame = async (values: UploadFormValues, resetForm?: () => void) => {
        try {
            const request = {
                developerId: "dev-profile-001", // ⚠️ 将来替换成登录用户 ID
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
            void message.success("Game uploaded successfully 🚀");
            resetForm?.(); // 如果传入 resetForm，则重置表单
        } catch (e) {
            if (e instanceof Error) {
                void message.error(e.message);
            } else {
                void message.error("Upload failed");
            }
        }
    };

    return { uploadGame };
}

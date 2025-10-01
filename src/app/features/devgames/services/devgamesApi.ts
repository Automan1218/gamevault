import { DevGame, UploadDevGameRequest, DevGameListResponse } from "../types/devGameTypes";
import { ENV } from "@/config/env";

const BASE_URL = ENV.DEVGAMES_API_URL;

export const devgamesApi = {
    // 上传游戏
    async upload(request: UploadDevGameRequest): Promise<DevGame> {
        const fd = new FormData();
        fd.append("developerId", request.developerId);
        fd.append("name", request.name);
        fd.append("description", request.description);
        fd.append("releaseDate", request.releaseDate);
        fd.append("image", request.image);
        if (request.video) fd.append("video", request.video);
        fd.append("zip", request.zip);

        const res = await fetch(`${BASE_URL}/upload`, {
            method: "POST",
            body: fd,
        });

        if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
        return res.json();
    },

    // // 按开发者获取游戏
    // async getByDeveloper(developerId: string): Promise<DevGameListResponse> {
    //     const res = await fetch(`${BASE_URL}/games/list/${developerId}`);
    //     if (!res.ok) throw new Error(`Get games failed: ${res.status}`);
    //     return res.json();
    // },
    //
    // // 获取单个游戏详情
    // async getById(id: string): Promise<DevGame> {
    //     const res = await fetch(`${BASE_URL}/games/${id}`);
    //     if (!res.ok) throw new Error(`Get game failed: ${res.status}`);
    //     return res.json();
    // },
    //
    // // 删除游戏
    // async delete(id: string): Promise<void> {
    //     const res = await fetch(`${BASE_URL}/games/${id}`, { method: "DELETE" });
    //     if (!res.ok) throw new Error(`Delete game failed: ${res.status}`);
    // },
};

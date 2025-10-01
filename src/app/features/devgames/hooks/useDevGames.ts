import { devgamesApi } from "@/app/features/devgames/services/devgamesApi";

const handleSubmit = async (values: any) => {
    const request = {
        developerId: "dev-profile-001",
        name: values.name,
        description: values.description ?? "",
        releaseDate: values.releaseDate?.toISOString() ?? new Date().toISOString(),
        image: values.image?.[0]?.originFileObj,
        video: values.video?.[0]?.originFileObj,
        zip: values.zip?.[0]?.originFileObj,
    };

    await devgamesApi.upload(request);
};

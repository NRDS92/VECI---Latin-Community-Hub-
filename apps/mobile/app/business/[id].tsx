import { router, useLocalSearchParams } from "expo-router";
import BusinessDetail from "../../src/features/business/components/BusinessDetail";
import BusinessDetailStatus from "../../src/features/business/components/BusinessDetailStatus";
import { useBusiness } from "../../src/features/business/hooks/useCreateBusiness";

export default function OwnerBusinessScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useBusiness(id);

  if (!data) {
    return <BusinessDetailStatus isLoading={isLoading} />;
  }

  return (
    <BusinessDetail
      data={{
        name: data.name,
        category: data.category,
        subCategory: data.subCategory,
        description: data.description,
        priceRange: data.priceRange,
        cityId: data.location.cityId,
        address: data.location.address,
        coordinates: data.location.coordinates,
        image: data.images.profile,
        coverImage: data.images.cover,
        contact: data.contact,
      }}
      onEdit={() => router.push({ pathname: "/business/CreateBusinessScreen", params: { id } })}
    />
  );
}

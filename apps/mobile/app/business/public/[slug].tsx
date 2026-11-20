import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { getPublicBusinessBySlug } from "../../../src/features/business/api/publicBusiness.api";
import BusinessDetail from "../../../src/features/business/components/BusinessDetail";
import BusinessDetailStatus from "../../../src/features/business/components/BusinessDetailStatus";

export default function PublicBusinessScreen() {
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const publicationSlug = typeof slug === "string" ? slug.trim() : "";
  const { data, isLoading } = useQuery({
    queryKey: ["public-business", publicationSlug],
    queryFn: () => getPublicBusinessBySlug(publicationSlug),
    enabled: Boolean(publicationSlug),
    retry: false,
  });

  return data ? <BusinessDetail data={data} /> : <BusinessDetailStatus isLoading={isLoading} />;
}

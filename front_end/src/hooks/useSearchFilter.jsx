import {useCallback, useState, useEffect, useRef} from "react";
import {useSearchParams} from "react-router-dom";

const INITIAL_SORT = "price-lowtohigh";

export const useSearchFilter = () => {
  console.log("useSearchFilter called");
  const [searchParams, setSearchParams] = useSearchParams();
  const isUpdatingRef = useRef(false);

  // Lưu trữ filters trong state nội bộ
  const [filtersState, setFiltersState] = useState({
    category: searchParams.get("category")?.split(",").filter(Boolean) || [],
    brand: searchParams.get("brand")?.split(",").filter(Boolean) || [],
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    sortBy: searchParams.get("sortBy") || INITIAL_SORT,
  });
  console.log("filtersState", filtersState);
  // Cập nhật filtersState khi searchParams thay đổi (ví dụ: khi nhấn back/forward)
  useEffect(() => {
    // Nếu đang cập nhật URL từ filtersState, bỏ qua để tránh vòng lặp
    if (isUpdatingRef.current) {
      isUpdatingRef.current = false;
      return;
    }

    const category =
      searchParams.get("category")?.split(",").filter(Boolean) || [];
    const brand = searchParams.get("brand")?.split(",").filter(Boolean) || [];
    const page = searchParams.get("page")
      ? Number(searchParams.get("page"))
      : 1;
    const sortBy = searchParams.get("sortBy") || INITIAL_SORT;

    setFiltersState({
      category,
      brand,
      page,
      sortBy,
    });
  }, [searchParams]);

  // Cập nhật searchParams khi filtersState thay đổi
  useEffect(() => {
    const params = new URLSearchParams();

    if (filtersState.category.length > 0) {
      params.set("category", filtersState.category.join(","));
    }
    if (filtersState.brand.length > 0) {
      params.set("brand", filtersState.brand.join(","));
    }
    if (filtersState.page) {
      params.set("page", filtersState.page.toString());
    }
    if (filtersState.sortBy) {
      params.set("sortBy", filtersState.sortBy);
    }

    // Chỉ cập nhật URL nếu khác với URL hiện tại
    const newParams = params.toString();
    const currentParams = searchParams.toString();

    if (newParams !== currentParams) {
      // Đánh dấu rằng đang cập nhật URL từ filtersState
      isUpdatingRef.current = true;
      setSearchParams(params);
    }
  }, [filtersState, setSearchParams, searchParams]);

  const updateFilters = useCallback((newFilters) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  return {
    category: filtersState.category,
    brand: filtersState.brand,
    page: filtersState.page,
    sortBy: filtersState.sortBy,
    updateFilters,
  };
};

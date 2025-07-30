import axiosClient from "@/apis/axiosClient";
import Loading from "@/components/common/Loading/Loading";
import Pagination from "@/components/common/Pagination";
import PostPreview from "@/components/shopping-view/postPreview";
import {useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";

function SearchBlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("s");
  let parseKeyword = keyword ? keyword.split("+").join(" ") : "";

  const [resultSearch, setResultSearch] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  useEffect(() => {
    async function searchPost() {
      setLoading(true);
      try {
        const keyword = searchParams.get("s");
        const page = searchParams.get("page")
          ? Number(searchParams.get("page"))
          : 1;
        let parseKeyword = keyword ? keyword.split("+").join(" ") : "";
        const response = await axiosClient.get(
          `/api/shop/post/search?keyword=${parseKeyword}&page=${page}`,
        );
        setResultSearch(response.data?.data);
        setPagination({
          page: response.data?.currentPage,
          totalPage: response.data?.totalPages,
        });
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
    searchPost();
  }, [searchParams]);
  const handlePageChange = (pageIndex) => {
    setSearchParams({s: searchParams.get("s"), page: pageIndex});
  };
  useEffect(() => {
    window.document.title = "Tìm kiếm blog";
  }, []);
  return (
    <div className="container mx-auto p-4 mt-[90px]">
      {parseKeyword ? (
        <>
          <div>
            <p className="uppercase font-bold text-[28px] t mb-[30px]">
              Kết quả tìm kiếm cho: "{parseKeyword}"
            </p>
            {loading ? (
              <Loading className="h-screen" />
            ) : resultSearch.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {resultSearch.map((post) => (
                    <PostPreview
                      key={post._id}
                      data={post}
                      variant="vertical"
                    />
                  ))}
                </div>
                <div>
                  <Pagination
                    pagination={pagination}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            ) : (
              <p>Không tìm thấy kết quả nào</p>
            )}
          </div>
        </>
      ) : (
        <div>
          <p>Vui lòng nhập từ khóa để tìm kiếm</p>
        </div>
      )}
    </div>
  );
}

export default SearchBlogPage;

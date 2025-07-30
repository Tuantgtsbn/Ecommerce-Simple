import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {filterOptions} from "@/config";
import {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {deleteProduct, getAllProducts} from "@/store/admin/products-slice";
import Loading from "@/components/common/Loading/Loading";
import ProductCard from "@/components/admin-view/product-page/ProductCard";
import {useToast} from "@/contexts/ToastContext";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import EditFormProduct from "@/components/admin-view/product-page/formEditProduct";
import FormAddProduct from "@/components/admin-view/product-page/formAddProduct";

function AdminProducts() {
  const dispatch = useDispatch();
  const {toast} = useToast();
  const [isOpenAddProductDialog, setIsOpenAddProductDialog] = useState(false);
  const [editedProductId, setEditedProductId] = useState(null);
  const [editFormData, setEditFormData] = useState(null);

  // New states for filtering and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const {productList} = useSelector((state) => state.adminProducts);

  // Filter products based on search and filters
  const filteredProducts = productList.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesBrand =
      selectedBrand === "all" || product.brand === selectedBrand;

    return matchesSearch && matchesCategory && matchesBrand;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    dispatch(getAllProducts());
  }, [dispatch]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const handleBrandChange = (value) => {
    setSelectedBrand(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const onClickEdit = (product) => {
    console.log(product);
    setEditFormData(product);
    setIsOpenAddProductDialog(true);
    setEditedProductId(product._id);
  };
  const onClickDelete = async (id) => {
    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast.success("Delete product successfully");
      await dispatch(getAllProducts()).unwrap();
      toast.success("Update product list successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    window.document.title = "Quản lý sản phẩm - Admin";
  }, []);
  return (
    <>
      {/* Filters Section */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4 justify-between">
          <div className="flex gap-4">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
              className="max-w-xs"
            />
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {filterOptions.category.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedBrand} onValueChange={handleBrandChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {filterOptions.brand.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => {
              setIsOpenAddProductDialog(true);
              setEditedProductId(null);
            }}
          >
            Add New Product
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span>Items per page:</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={handleItemsPerPageChange}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder={itemsPerPage} />
            </SelectTrigger>
            <SelectContent>
              {[4, 8, 12, 16, 20].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="ml-4">
            Showing {startIndex + 1}-
            {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of{" "}
            {filteredProducts.length}
          </span>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {productList.length > 0 ? (
          paginatedProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onClickEdit={() => onClickEdit(product)}
              onClickDelete={() => onClickDelete(product._id)}
            />
          ))
        ) : (
          <Loading className="h-screen" />
        )}
      </div>

      {/* Pagination Controls */}
      <div className="mt-6 flex items-center justify-center">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {[...Array(totalPages)].map((_, index) => (
            <Button
              key={index + 1}
              variant={currentPage === index + 1 ? "default" : "outline"}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Existing Dialog */}
      <Sheet
        open={isOpenAddProductDialog}
        onOpenChange={() => setIsOpenAddProductDialog(false)}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {editedProductId ? "Form edit product" : "Form add product"}
            </SheetTitle>
            <SheetDescription>
              Please fill in the information below carefully to add a new
              product
            </SheetDescription>
          </SheetHeader>
          <div className="mt-5">
            {editedProductId ? (
              <EditFormProduct
                initialFormData={editFormData}
                setIsOpenAddProductDialog={setIsOpenAddProductDialog}
              />
            ) : (
              <FormAddProduct setOpenDialog={setIsOpenAddProductDialog} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default AdminProducts;

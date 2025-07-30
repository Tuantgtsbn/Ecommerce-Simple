import {useEffect, useState, useMemo, useCallback} from "react";

import {useDispatch, useSelector} from "react-redux";
import {useToast} from "@/contexts/ToastContext";
import {formatDateCustom} from "@/lib/utils";
import classNames from "classnames";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {ArrowUpDown, ArrowUp, ArrowDown} from "lucide-react";
import {getAllContacts, getDetailContact} from "@/store/admin/contact-slice";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {Dialog} from "@/components/ui/dialog";
import FormUpdateContact from "@/components/admin-view/formUpdateContact";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import AdminContactDetail from "@/components/admin-view/contact-detail";

function AdminContact() {
  const [openDetailContact, setOpenDetailContact] = useState(false);
  const [openUpdateContact, setOpenUpdateContact] = useState(false);
  const {
    listContacts,
    detailContact,
    isLoadingGetDetail,
    isLoading,
    isLoadingUpdate,
    error,
  } = useSelector((state) => state.adminContacts);
  const {toast} = useToast();
  const dispatch = useDispatch();
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  // Memoize handlers
  const handleOpenDetailContact = useCallback(
    async (id) => {
      try {
        await dispatch(getDetailContact(id)).unwrap();
        setOpenDetailContact(true);
      } catch (error) {
        toast.error(error);
      }
    },
    [dispatch, toast],
  );

  const handleOpenUpdateDialog = useCallback(
    async (id) => {
      try {
        await dispatch(getDetailContact(id)).unwrap();
        setOpenUpdateContact(true);
      } catch (error) {
        toast.error(error);
      }
    },
    [dispatch, toast],
  );

  // Memoize statusOptions
  const statusOptions = useMemo(
    () => [
      {value: "all", label: "All contacts"},
      {value: "false", label: "Unread"},
      {value: "true", label: "Read"},
    ],
    [],
  );

  // Fetch orders only once on mount
  useEffect(() => {
    const fetchAllContacts = async () => {
      try {
        await dispatch(getAllContacts()).unwrap();
      } catch (error) {
        toast.error(error);
      }
    };
    fetchAllContacts();
  }, [dispatch]);
  useEffect(() => {
    window.document.title = "Quản lý liên hệ - Admin";
  }, []);

  // Memoize columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "_id",
        header: ({column}) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting()}
              className="p-0 hover:bg-transparent"
            >
              Contact ID
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      },
      {
        accessorKey: "createdAt",
        header: ({column}) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting()}
              className="p-0 hover:bg-transparent"
            >
              Contact Date
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: (info) => formatDateCustom(info.getValue(), "longDate"),
      },
      {
        accessorKey: "username",
        header: ({column}) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting()}
              className="p-0 hover:bg-transparent"
            >
              Name of customer
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      },
      {
        accessorKey: "read",
        header: ({column}) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting()}
              className="p-0 hover:bg-transparent"
            >
              Status
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: (info) => (
          <Badge
            className={classNames({
              "bg-green-500": info.getValue(),

              "bg-red-500": !info.getValue(),
            })}
          >
            {info.getValue() ? "Read" : "Unread"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({row}) => (
          <div className="space-x-2">
            <Button
              className="bg-yellow-500 text-white"
              onClick={() => handleOpenUpdateDialog(row.original._id)}
              disabled={isLoadingGetDetail}
            >
              Update Status
            </Button>
            <Button className="bg-red-500 text-white">Cancel</Button>
            <Button
              className="bg-green-500 text-white"
              onClick={() => handleOpenDetailContact(row.original._id)}
              disabled={isLoadingGetDetail}
            >
              View detail
            </Button>
          </div>
        ),
      },
    ],
    [handleOpenDetailContact, handleOpenUpdateDialog, isLoadingGetDetail],
  );

  // Memoize table state
  const tableState = useMemo(
    () => ({
      sorting,
      globalFilter,
      columnFilters:
        statusFilter !== "all"
          ? [{id: "read", value: statusFilter === "true"}]
          : [],
    }),
    [sorting, globalFilter, statusFilter],
  );

  // Memoize table instance
  const table = useReactTable({
    data: listContacts,
    columns,
    state: {
      ...tableState,
      pagination,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  console.log(table.getState().pagination.pageIndex);
  const handleCloseUpdateDialog = useCallback(() => {
    setOpenUpdateContact(false);
  }, []);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All contact</CardTitle>
          <div className="flex items-center gap-4 mt-4">
            <Input
              placeholder="Search contacts..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={table.getState().pagination.pageSize}
              onValueChange={(value) => {
                console.log(value);
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={"Rows per page"} />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30].map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <h1>Loading...</h1>
          ) : error?.getAllContacts ? (
            <h1>{error.getAllContacts}</h1>
          ) : (
            <>
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="text-center"
                      >
                        No orders found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                  {table.getFilteredRowModel().rows.length} contacts(s) total
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Previous
                  </Button>
                  {table.getPageOptions().map((page, index) => (
                    <Button
                      key={index}
                      variant={
                        table.getState().pagination.pageIndex === page
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => table.setPageIndex(page)}
                    >
                      {page + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <Dialog open={openDetailContact} onOpenChange={setOpenDetailContact}>
        <AdminContactDetail />
      </Dialog>
      <Dialog open={openUpdateContact} onOpenChange={setOpenUpdateContact}>
        <FormUpdateContact closeDialog={handleCloseUpdateDialog} />
      </Dialog>
    </>
  );
}

export default AdminContact;

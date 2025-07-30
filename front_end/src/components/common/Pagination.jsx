import {memo} from "react";
import {IoIosArrowBack, IoIosArrowForward} from "react-icons/io";
import classNames from "classnames";
import {Button} from "../ui/button";
const Pagination = memo(({pagination, onPageChange}) => {
  console.log("Pagination: ", pagination);
  return (
    <div className="mt-6 flex justify-center gap-2">
      {pagination?.page > 1 && (
        <Button
          varriant="outline"
          className="flex justify-center rounded-full items-center w-[40px] h-[40px] !px-0 !py-0 bg-gray-500 !text-black hover:bg-gray-400"
          onClick={() => onPageChange(pagination.page - 1)}
        >
          <IoIosArrowBack size="16" />
        </Button>
      )}

      {[...Array(pagination?.totalPage)].map((_, i) => (
        <Button
          className={classNames(
            "flex justify-center rounded-full items-center w-[40px] h-[40px] !px-0 !py-0 bg-gray-500 hover:bg-gray-400",
            {
              " !bg-black": i + 1 === pagination?.page,
              "!text-black": i + 1 !== pagination?.page,
            },
          )}
          key={i + 1}
          onClick={() => onPageChange(i + 1)}
        >
          {i + 1}
        </Button>
      ))}

      {pagination?.page < pagination?.totalPage && (
        <Button
          className="flex justify-center rounded-full items-center w-[40px] h-[40px] !px-0 !py-0 bg-gray-500 !text-black hover:bg-gray-400"
          onClick={() => onPageChange(pagination.page + 1)}
        >
          <IoIosArrowForward />
        </Button>
      )}
    </div>
  );
});
Pagination.displayName = "Pagination";
export default Pagination;

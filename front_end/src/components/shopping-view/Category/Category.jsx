import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Search} from "lucide-react";
import {useState} from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {TfiArrowTopRight} from "react-icons/tfi";

function CategoryDialog({categories, open, setIsOpenListCategory}) {
  const [searchTerm, setSearchTerm] = useState("");
  const renderCategory = (category, level = 0) => {
    return (
      <div key={category._id} className="text-[20px]">
        {level === 0 && (
          <div className="flex gap-3 items-center">
            <p>{category.name}</p>
            <TfiArrowTopRight />
          </div>
        )}
        <Accordion type="single" collapsible>
          {category.children.map((child) =>
            child.children.length > 0 ? (
              <AccordionItem value={child.name}>
                <AccordionTrigger>{child.name}</AccordionTrigger>
                <AccordionContent>
                  <div style={{paddingLeft: `${level * 20}px`}}>
                    {renderCategory(child, level + 1)}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ) : (
              <div
                style={{paddingLeft: `${level * 20}px`}}
                className="mb-[16px]"
              >
                {child.name}
              </div>
            ),
          )}
        </Accordion>
      </div>
    );
  };
  return (
    <Dialog open={open} onOpenChange={setIsOpenListCategory}>
      <DialogContent className="max-w-[90%]">
        <DialogHeader>
          <div>
            <DialogTitle className="text-center text-2xl">
              Select category
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="grid grid-cols-3 gap-20">
            {categories.map((category) => renderCategory(category))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default CategoryDialog;

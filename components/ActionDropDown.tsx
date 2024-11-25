"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Models } from "node-appwrite";
import { actionsDropdownItems } from "@/constants";
import { it } from "node:test";
import Link from "next/link";
import { constructDownloadUrl } from "@/lib/utils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const ActionDropDown = ({ file }: { file: Models.Document }) => {
  const [isModalOpen, setisModalOpen] = useState(false);
  const [isDropdownOpen, setisDropdownOpen] = useState(false);
  const [action, setaction] = useState<ActionType | null>(null);
  const [name, setname] = useState(file.name)
  const [loading, setloading] = useState(false)

  const closeAllModel = () => {
    setloading(false)
    setisDropdownOpen(false)
    setaction(null)
    setname(file.name)
  }

  const handleAction = async () => {

  }

  const renderDialogContent = () => {
    if(!action) return null

    const {value, label} = action
    return (
      <DialogContent className="shad-dialog button">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-light-100">{label}</DialogTitle>
          {value === "rename" && (
            <Input type="text" value={name} onChange={(e) => setname(e.target.value)}/>
          )}
        </DialogHeader>
        {
            ["rename", "delete","share"].includes(value) && 
                <DialogFooter className="flex flex-col gap-3 md:flex-row">
                    <Button className="modal-cancel-button" onClick={closeAllModel}>Cancel</Button>
                    <Button onClick={handleAction} className="modal-submit-button"><p className="capitalize">{value}</p>
                    {loading && <Image src={"/assets/icons/loader.svg"} alt="loader" width={24} height={24} className="animate-spin"/>}
                    </Button>
                </DialogFooter>
             
        }
      </DialogContent>
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setisModalOpen}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setisDropdownOpen}>
        <DropdownMenuTrigger className="shad-no-focus">
          <Image
            src={"/assets/icons/dots.svg"}
            alt="menu"
            width={34}
            height={34}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="max-w-[200px] truncate">
            {file.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actionsDropdownItems.map((item) => (
            <DropdownMenuItem
              key={item.value}
              className="shad-dropdown-item"
              onClick={() => {
                setaction(item);
                if (
                  ["rename", "share", "delete", "details"].includes(item.value)
                ) {
                  setisModalOpen(true);
                }
              }}
            >
              {item.label === "Download" ? (
                <Link
                  href={constructDownloadUrl(file.bucketFileId)}
                  download={file.name}
                  className="flex items-center gap-2"
                >
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={30}
                    height={30}
                  />
                  {item.label}
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={30}
                    height={30}
                  />
                  {item.label}
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {renderDialogContent()}
    </Dialog>
  );
};

export default ActionDropDown;

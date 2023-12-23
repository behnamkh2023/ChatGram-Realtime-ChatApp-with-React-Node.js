import React from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { useTranslation } from "react-i18next";

type dialogProps = {
  title: string;
  description: string;
  openDialog: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  onHandler?: () => void;
};

export default function Dialogs({
  title,
  description,
  openDialog,
  setOpenDialog,
  onHandler,
}: dialogProps) {
  const { t } = useTranslation();
  const size = window.matchMedia("(min-width: 768px)").matches ? "sm" : "xl";
  return (
    <Dialog
      open={openDialog}
      size={size}
      animate={{
        mount: { scale: 1, y: 0 },
        unmount: { scale: 0.5, y: 0 },
      }}
      handler={() => {}}
    >
      <DialogHeader className="text-lg p-4 pb-2">{title}</DialogHeader>
      <DialogBody className="text-black font-normal py-2 px-4">
        {description}
      </DialogBody>
      <DialogFooter>
        <Button
          variant="text"
          color="gray"
          onClick={() => setOpenDialog(!openDialog)}
          className="mx-1"
        >
          <span>{t("cancel")}</span>
        </Button>

        {onHandler && (
          <Button
            variant="text"
            color="red"
            onClick={onHandler}
            className="mx-1"
          >
            <span>{t("yes")}</span>
          </Button>
        )}
      </DialogFooter>
    </Dialog>
  );
}

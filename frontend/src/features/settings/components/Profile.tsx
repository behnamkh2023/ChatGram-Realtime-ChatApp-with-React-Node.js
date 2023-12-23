import React, { useState } from "react";
import { FiArrowLeft, FiCamera, FiPlus, FiArrowRight } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button, Input } from "@material-tailwind/react";
import { useSelector, useDispatch } from "react-redux";
import { useFormik } from "formik";

import avatar from "../../../assets/user.jpg";
import Dialogs from "../../../components/Dialog";
import { updateUser } from "../../../features/authentication/authSlice";
import { AppDispatch, RootState } from "../../../redux/store";
import type { valuesType } from "../types";
export default function Profile({
  onEditProfile,
}: {
  onEditProfile: (name: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const {
    data: user,
    loading,
  } = useSelector((state: RootState) => state.login);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const formik = useFormik({
    initialValues: {
      firstName: user?.firstName,
      lastName: user?.lastName,
      image: user?.avatar,
    },
 
    onSubmit: (values:valuesType) => {
      let formData: FormData = new FormData();
      formData.append("userID", user._id);
      formData.append("firstName", values["firstName"] ?? "");
      formData.append("lastName", values["lastName"] ?? "");

      if (values["image"] !== undefined) {
        if (values["image"] instanceof File &&  values["image"].size > 3000000) {
          setOpenDialog(true);
          return;
        } else {
          formData.append("image", values["image"]);
        }
      }
      dispatch(updateUser(formData));
    },
  });

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0.6, x: 20 }}
      animate={{
        x: 0,
        transform: "scale(1)",
        opacity: 1,
        transition: { duration: 0.2, ease: "easeInOut" },
      }}
    >
      <div
        className={`flex flex-col bg-white p-4 shadow mb-2 ${
          loading ? "opacity-50" : ""
        }`}
      >
        <div
          className="flex items-center cursor-pointer mb-4"
          onClick={() => onEditProfile(t("settings"))}
        >
          <div>
            {i18n.dir() == "ltr" ? (
              <FiArrowLeft fontSize={22} />
            ) : (
              <FiArrowRight fontSize={22} />
            )}
          </div>
          <div className="text-lg ltr:ml-4 rtl:mr-4">{t("settings")}</div>
        </div>
        <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
          <div className="flex w-full justify-center gap-4 my-2 ">
            <div className=" rounded-full">
              <img
                src={
                  selectedImage
                    ? URL.createObjectURL(selectedImage)
                    : user?.avatar ?? avatar
                }
                alt="avatar"
                className="w-28 h-28 rounded-full"
              />

              <div className="z-10 absolute cursor-pointer">
                <input
                  id="imageProfile"
                  name="image"
                  type="file"
                  accept="image/jpg, image/jpeg, image/png"
                  title={t("selectImage")}
                  className="opacity-0 w-10 absolute z-50"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    if (event.target.files && event.target.files.length > 0) {
                      const selectedFile = event.target.files[0];
                      formik.setFieldValue("image", selectedFile);
                      setSelectedImage(selectedFile);
                    } else {
                      setSelectedImage(null);
                    }
                  }}
                />
                <label htmlFor="imageProfile" className="cursor-pointer">
                  <div className="text-zinc-300 relative  bottom-16 ltr:left-10 rtl:right-10">
                    <FiCamera fontSize={30} />
                  </div>
                  <div className="text-zinc-300 absolute  bottom-16 ltr:left-14 rtl:right-11 z-50	">
                    <FiPlus fontSize={20} />
                  </div>
                </label>
              </div>
            </div>
          </div>
          <div className="flex w-full items-end gap-4 my-4">
            <Input
              size="lg"
              label={`${t("firstName")}`}
              id="firstName"
              name="firstName"
              type="text"
              onChange={formik.handleChange}
              value={formik.values.firstName ?? formik.values.firstName}
              crossOrigin="anonymous"
            />
          </div>
          <div className="flex w-full items-end gap-4 my-4">
            <Input
              size="lg"
              label={`${t("lastName")}`}
              id="lastName"
              name="lastName"
              type="text"
              onChange={formik.handleChange}
              value={formik.values.lastName ?? formik.values.lastName}
              crossOrigin="anonymous"
              className=""
            />
          </div>
          <div className="flex w-full items-end gap-4 my-4">
            <Button fullWidth color="light-blue" type="submit">
              {loading ? `${t("saving")}` : `${t("save")}`}{" "}
            </Button>
          </div>
        </form>
      </div>
      <Dialogs
        title="Size error"
        description="Your file size is too large, please use a smaller size."
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}

      />
    </motion.div>
  );
}

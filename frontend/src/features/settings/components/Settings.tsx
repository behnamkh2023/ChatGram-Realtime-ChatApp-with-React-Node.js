import { useState } from "react";

import Index from "./Index";
import Profile from "./Profile";
import Lang from "./Lang";

export default function Settings() {
  const [editPart, setEditPart] = useState<string>();
  const editProfile = (name: string) => {
    setEditPart(name);
  };

  if (editPart == "editProfile") {
    return <Profile onEditProfile={editProfile} />;
  } else if (editPart == "lang") {
    return <Lang onEditProfile={editProfile} />;
  } else {
    return <Index onEditProfile={editProfile} />;
  }
}

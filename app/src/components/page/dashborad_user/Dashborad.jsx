import React from "react";
import Nagigate from "../../layout/nagigate.jsx";
import NavigateUser from "./navigateUser.jsx";
import { Outlet } from "react-router-dom";
export default function Dashborad() {
  return (
    <div>
      <Nagigate className="" />
      <div className="container">
        <div className="grid grid-cols-4 grid-rows-3 gap-4">
          <div className="row-span-3">
            <NavigateUser />
          </div>
          <div className="col-span-3 row-span-3">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

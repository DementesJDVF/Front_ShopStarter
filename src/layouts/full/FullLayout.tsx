import { FC, useState } from 'react';
import { Outlet } from "react-router";
import ScrollToTop from 'src/components/shared/ScrollToTop';
import Sidebar from './sidebar/Sidebar';
import Header from './header/Header';
import Topbar from './header/Topbar';

const FullLayout: FC = () => {
  return (
    <>
      <Topbar />
      <div className="flex w-full min-h-screen dark:bg-darkgray overflow-hidden">
        <div className="page-wrapper flex w-full relative">
          {/* Sidebar */}
          <Sidebar />
          <div className="page-wrapper-sub flex flex-col w-full dark:bg-darkgray">
            <Header />
            <div className="bg-lightgray dark:bg-dark h-full rounded-bb p-6">
              <ScrollToTop>
                <div className="container mx-auto">
                  <Outlet />
                </div>
              </ScrollToTop>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FullLayout;

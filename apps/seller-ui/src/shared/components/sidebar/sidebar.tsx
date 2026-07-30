"use client";
import useSeller from "apps/seller-ui/src/hooks/useSeller";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import Box from "../box";
import { Sidebar } from "./sidebar.styles";
import Link from "next/link";
import Logo from "apps/seller-ui/src/app/assets/svgs/logo";
import useSidebar from "apps/seller-ui/src/hooks/useSidebar";
import Home from "apps/seller-ui/src/app/assets/icons/home";
import SidebarItem from "./sidebar.item";
import SidebarMenu from "./sidebar.menu";
import {
  Bell,
  BellPlus,
  BellRing,
  CalendarPlus,
  ListOrdered,
  LogOut,
  Mail,
  PackageSearch,
  Settings,
  SquarePlus,
  TicketPercent,
} from "lucide-react";
import Payment from "apps/seller-ui/src/app/assets/icons/payment";

const SidebarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathname = usePathname();
  const { seller } = useSeller();

  useEffect(() => {
    setActiveSidebar(pathname);
  }, [pathname, setActiveSidebar]);

  const getIconColor = (route: string) => {
    return activeSidebar === route ? "#0085ff" : "#969696";
  };

  return (
    <Box
      css={{
        height: "100vh",
        zIndex: 202,
        position: "sticky",
        padding: "8px",
        top: 0,
        overflowY: "scroll",
        scrollbarWidth: "none",
      }}
      className="sidebar-wrapper"
    >
      <Sidebar.Header>
        <Box>
          <Link className="flex justify-center text-center gap-2" href={"/"}>
            <Logo />

            <Box>
              <h3 className="text-xl font-medium text-[#ecedee]">
                {seller?.shop?.name}
              </h3>

              <h5 className="text-xs font-medium text-[#ecedeecf] pl-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]">
                {seller?.shop?.address}
              </h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>

      <div className="block my-3 h-full">
        <Sidebar.Body className="body sidebar">
          <SidebarItem
            title="Dashboard"
            icon={<Home fill={getIconColor("/dashboard")} />}
            isActive={activeSidebar === "/dashboard"}
            href="/dashboard"
          />
          <div className="mt-2 block">
            <SidebarMenu title="Main Menu">
              <SidebarItem
                title="Orders"
                isActive={activeSidebar === "/dashboard/orders"}
                href="/dashboard/orders"
                icon={
                  <ListOrdered
                    size={26}
                    color={getIconColor("/dashboard/orders")}
                  />
                }
              />
              <SidebarItem
                title="Payments"
                isActive={activeSidebar === "/dashboard/payments"}
                href="/dashboard/payments"
                icon={<Payment fill={getIconColor("/dashboard/payments")} />}
              />
            </SidebarMenu>
            <SidebarMenu title="Products">
              <SidebarItem
                title="Create Products"
                isActive={activeSidebar === "/dashboard/create-product"}
                href="/dashboard/create-product"
                icon={
                  <SquarePlus
                    size={24}
                    color={getIconColor("/dashboard/create-product")}
                  />
                }
              />
              <SidebarItem
                title="All Products"
                isActive={activeSidebar === "/dashboard/all-products"}
                href="/dashboard/all-products"
                icon={
                  <PackageSearch
                    size={24}
                    color={getIconColor("/dashboard/all-products")}
                  />
                }
              />
            </SidebarMenu>

            <SidebarMenu title="Events">
              <SidebarItem
                title="Create Event"
                isActive={activeSidebar === "/dashboard/create-event"}
                href="/dashboard/create-event"
                icon={
                  <CalendarPlus
                    size={24}
                    color={getIconColor("/dashboard/create-event")}
                  />
                }
              />
              <SidebarItem
                title="All Events"
                isActive={activeSidebar === "/dashboard/all-events"}
                href="/dashboard/all-events"
                icon={
                  <BellPlus
                    size={24}
                    color={getIconColor("/dashboard/all-events")}
                  />
                }
              />
            </SidebarMenu>

            <SidebarMenu title="Controllers">
              <SidebarItem
                title="Inbox"
                isActive={activeSidebar === "/dashboard/inbox"}
                href="/dashboard/inbox"
                icon={
                  <Mail size={20} color={getIconColor("/dashboard/inbox")} />
                }
              />
              <SidebarItem
                title="Settings"
                isActive={activeSidebar === "/dashboard/settings"}
                href="/dashboard/settings"
                icon={
                  <Settings
                    size={20}
                    color={getIconColor("/dashboard/settings")}
                  />
                }
              />
              <SidebarItem
                title="Notifications"
                isActive={activeSidebar === "/dashboard/notifications"}
                href="/dashboard/notifications"
                icon={
                  <BellRing
                    size={20}
                    color={getIconColor("/dashboard/notifications")}
                  />
                }
              />
            </SidebarMenu>

            <SidebarMenu title="Extras">
              <SidebarItem
                title="Discount Codes"
                isActive={activeSidebar === "/dashboard/discount-codes"}
                href="/dashboard/discount-codes"
                icon={
                  <TicketPercent
                    size={22}
                    color={getIconColor("/discount-codes")}
                  />
                }
              />
              <SidebarItem
                title="Logout"
                isActive={activeSidebar === "/dashboard/logout"}
                href="/logout"
                icon={<LogOut size={22} color={getIconColor("/logout")} />}
              />
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  );
};

export default SidebarWrapper;

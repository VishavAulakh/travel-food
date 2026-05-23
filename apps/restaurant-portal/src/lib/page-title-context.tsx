"use client";

import React, { createContext, useContext, useState } from "react";

type PageTitleContextValue = {
  title: string;
  subtitle?: string;
  setPageTitle: (title: string, subtitle?: string) => void;
};

const PageTitleContext = createContext<PageTitleContextValue>({
  title: "Travel Food",
  subtitle: undefined,
  setPageTitle: () => {},
});

export function PageTitleProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = useState("Travel Food");
  const [subtitle, setSubtitle] = useState<string | undefined>();

  const setPageTitle = (newTitle: string, newSubtitle?: string) => {
    setTitle(newTitle);
    setSubtitle(newSubtitle);
  };

  return (
    <PageTitleContext.Provider value={{ title, subtitle, setPageTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}

export function usePageTitle() {
  return useContext(PageTitleContext);
}

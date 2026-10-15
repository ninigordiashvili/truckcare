import React, { createContext, useContext, useMemo, useState } from 'react';

const NavCtx = createContext(null);

export function NavProvider({ initial, initialParams, children }) {
  const [stack, setStack] = useState([{ name: initial, params: initialParams || {} }]);

  const api = useMemo(
    () => ({
      current: stack[stack.length - 1],
      canGoBack: stack.length > 1,
      push: (name, params = {}) => setStack((st) => [...st, { name, params }]),
      replace: (name, params = {}) => setStack((st) => [...st.slice(0, -1), { name, params }]),
      pop: () => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st)),
      reset: (name, params = {}) => setStack([{ name, params }]),
    }),
    [stack]
  );

  return <NavCtx.Provider value={api}>{children}</NavCtx.Provider>;
}

export function useNav() {
  const v = useContext(NavCtx);
  if (!v) throw new Error('NavProvider აკლია');
  return v;
}

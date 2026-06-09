export type PageMetric = {
  label: string;
  value: string;
  hint?: string;
};

export type PageDescriptor = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export type RouteNotFoundProps = {
  pathname: string;
};

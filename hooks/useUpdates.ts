import { useEffect, useState } from "react";

export type UpdateType = "JOB" | "EXAM";

export interface UpdateItem {
  _id: string;
  type: UpdateType;
  title: string;
  description: string;
  officialUrl: string;
  priority: number;
}

export function useUpdates(type: UpdateType, limit = 10) {
  const [data, setData] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch(`/next-api/updates?type=${type}&limit=${limit}`)
      .then(res => res.json())
      .then(res => {
        if (active) setData(res);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [type, limit]);

  return { data, loading };
}

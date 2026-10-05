"use client";

import * as React from "react";
import { AlertTriangle, Boxes, Wrench } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { KpiCard } from "@/components/fleet/kpi-card";
import { fetchSpares, fetchResources } from "@/lib/api";
import type { Part, Technician, Facility } from "@/lib/types";

const LOCATION_VARIANT = { "Base Store": "healthy", "Regional Depot": "monitor", "OEM Depot": "critical" } as const;
const REPAIR_VARIANT = {
  available: "healthy",
  "in-repair": "monitor",
  "awaiting-overhaul": "monitor",
  depleted: "critical",
} as const;

export default function SparesPage() {
  const [spares, setSpares] = React.useState<Part[]>([]);
  const [technicians, setTechnicians] = React.useState<Technician[]>([]);
  const [facilities, setFacilities] = React.useState<Facility[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([fetchSpares(), fetchResources()]).then(([spareData, resourceData]) => {
      setSpares(spareData);
      setTechnicians(resourceData.technicians);
      setFacilities(resourceData.facilities);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-sm text-muted">Loading spares and resource data…</div>;

  const atRisk = spares.filter((p) => p.stock <= p.minStock);
  const availableTechs = technicians.filter((t) => t.available).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold">Spares & Resources</h1>
        <p className="text-sm text-muted">Health-aware spares inventory linked to predicted component demand</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <KpiCard label="Parts at/under Min Stock" value={atRisk.length} icon={AlertTriangle} tone="critical" />
        <KpiCard label="Tracked Part Numbers" value={spares.length} icon={Boxes} tone="default" />
        <KpiCard label="Technicians Available" value={`${availableTechs} / ${technicians.length}`} icon={Wrench} tone="healthy" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spares Inventory</CardTitle>
          <CardDescription>Stock, lead time and repair status by part</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part</TableHead>
                <TableHead>Part Number</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Min Stock</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Lead Time</TableHead>
                <TableHead>Repair Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {spares
                .slice()
                .sort((a, b) => a.stock - b.minStock - (b.stock - a.minStock))
                .map((part) => (
                  <TableRow key={part.id} className={part.stock <= part.minStock ? "bg-critical/5" : undefined}>
                    <TableCell>{part.name}</TableCell>
                    <TableCell className="font-tabular text-xs text-muted">{part.partNumber}</TableCell>
                    <TableCell className="font-tabular">
                      <span className={part.stock <= part.minStock ? "text-critical font-medium" : ""}>{part.stock}</span>
                    </TableCell>
                    <TableCell className="font-tabular text-muted">{part.minStock}</TableCell>
                    <TableCell>
                      <Badge variant={LOCATION_VARIANT[part.location]}>{part.location}</Badge>
                    </TableCell>
                    <TableCell className="font-tabular">{part.leadTimeDays}d</TableCell>
                    <TableCell>
                      <Badge variant={REPAIR_VARIANT[part.repairStatus]} className="capitalize">
                        {part.repairStatus.replace("-", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Technicians</CardTitle>
            <CardDescription>Specialty and facility assignment</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Facility</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {technicians.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.name}</TableCell>
                    <TableCell className="text-muted">{t.specialty}</TableCell>
                    <TableCell className="text-xs text-muted">{t.facility}</TableCell>
                    <TableCell>
                      <Badge variant={t.available ? "healthy" : "muted"}>{t.available ? "Available" : "Assigned"}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance Facilities</CardTitle>
            <CardDescription>Capacity and current utilization</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {facilities.map((f) => (
              <div key={f.id} className="flex items-center justify-between text-sm border-b border-border last:border-0 pb-2">
                <div>
                  <div className="font-medium">{f.name}</div>
                  <div className="text-xs text-muted">{f.location}</div>
                </div>
                <div className="text-right">
                  <div className="font-tabular text-sm">{Math.round(f.utilization * 100)}%</div>
                  <div className="text-xs text-muted font-tabular">cap. {f.capacity}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

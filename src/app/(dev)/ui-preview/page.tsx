"use client";

import { useState } from "react";
import { Search, Eye, EyeOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { DataTable } from "@/components/ui/table";
import type { ColumnDef } from "@tanstack/react-table";

// ─── 섹션 래퍼 ───────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-white border-b border-white/[0.12] pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}

// ─── 샘플 데이터 ──────────────────────────────────────────
type SampleRow = { name: string; role: string; status: string; date: string };
const sampleData: SampleRow[] = [
  { name: "김철수", role: "회원", status: "confirmed", date: "2026-04-06" },
  { name: "이영희", role: "트레이너", status: "pending", date: "2026-04-07" },
  { name: "박민준", role: "관리자", status: "completed", date: "2026-04-08" },
  { name: "최수아", role: "회원", status: "cancelled", date: "2026-04-09" },
  { name: "정다은", role: "회원", status: "rejected", date: "2026-04-10" },
];
const sampleColumns: ColumnDef<SampleRow, unknown>[] = [
  { accessorKey: "name", header: "이름" },
  { accessorKey: "role", header: "역할" },
  {
    accessorKey: "status",
    header: "상태",
    cell: ({ getValue }) => {
      const v = getValue() as string;
      return <Badge variant={v as never}>{v}</Badge>;
    },
  },
  { accessorKey: "date", header: "날짜" },
];

// ─── 메인 ─────────────────────────────────────────────────
export default function UIPreviewPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="min-h-screen px-6 py-10 max-w-4xl mx-auto space-y-14">
      <div>
        <h1 className="text-4xl font-bold text-white">UI Components</h1>
        <p className="mt-1 text-slate-400 text-sm">FitCenter 디자인 시스템 프리뷰</p>
      </div>

      {/* ── Button ── */}
      <Section title="Button">
        <Row>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </Row>
        <Row>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Row>
        <Row>
          <Button isLoading>Loading...</Button>
          <Button disabled>Disabled</Button>
        </Row>
      </Section>

      {/* ── Input ── */}
      <Section title="Input">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
          <Input label="이름" placeholder="홍길동" />
          <Input
            label="비밀번호"
            type={showPw ? "text" : "password"}
            placeholder="••••••••"
            rightIcon={
              <button onClick={() => setShowPw((p) => !p)} className="cursor-pointer">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          <Input
            label="검색"
            type="search"
            placeholder="회원 검색..."
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Input label="에러 상태" placeholder="입력" error="필수 항목입니다." />
        </div>
      </Section>

      {/* ── Select ── */}
      <Section title="Select">
        <div className="max-w-xs">
          <Select
            label="역할"
            placeholder="역할 선택"
            options={[
              { value: "admin", label: "관리자" },
              { value: "trainer", label: "트레이너" },
              { value: "member", label: "회원" },
            ]}
          />
        </div>
      </Section>

      {/* ── Badge ── */}
      <Section title="Badge">
        <Row>
          <Badge variant="default">기본</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">성공</Badge>
          <Badge variant="warning">경고</Badge>
          <Badge variant="danger">위험</Badge>
          <Badge variant="muted">비활성</Badge>
        </Row>
        <Row>
          <Badge variant="pending">pending</Badge>
          <Badge variant="confirmed">confirmed</Badge>
          <Badge variant="rejected">rejected</Badge>
          <Badge variant="cancelled">cancelled</Badge>
          <Badge variant="completed">completed</Badge>
        </Row>
      </Section>

      {/* ── Card ── */}
      <Section title="Card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>기본 카드</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm">glassmorphism 스타일의 기본 카드입니다.</p>
            </CardContent>
          </Card>
          <Card hover>
            <CardHeader>
              <CardTitle>호버 카드</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm">마우스를 올리면 밝아집니다.</p>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* ── Spinner ── */}
      <Section title="Spinner">
        <Row>
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </Row>
      </Section>

      {/* ── Tabs ── */}
      <Section title="Tabs">
        <Tabs defaultTab="day">
          <TabList className="max-w-xs">
            <Tab value="day">일간</Tab>
            <Tab value="week">주간</Tab>
            <Tab value="month">월간</Tab>
          </TabList>
          <TabPanel value="day">
            <Card><CardContent><p className="text-slate-300">일간 뷰 콘텐츠</p></CardContent></Card>
          </TabPanel>
          <TabPanel value="week">
            <Card><CardContent><p className="text-slate-300">주간 뷰 콘텐츠</p></CardContent></Card>
          </TabPanel>
          <TabPanel value="month">
            <Card><CardContent><p className="text-slate-300">월간 뷰 콘텐츠</p></CardContent></Card>
          </TabPanel>
        </Tabs>
      </Section>

      {/* ── Toast ── */}
      <Section title="Toast">
        <Row>
          <Button onClick={() => toast.success("저장되었습니다.")}>Success Toast</Button>
          <Button variant="danger" onClick={() => toast.error("오류가 발생했습니다.")}>Error Toast</Button>
          <Button variant="ghost" onClick={() => toast.warning("주의가 필요합니다.")}>Warning Toast</Button>
          <Button variant="secondary" onClick={() => toast("일반 알림입니다.")}>Default Toast</Button>
        </Row>
      </Section>

      {/* ── Dialog ── */}
      <Section title="Dialog / Modal">
        <Button onClick={() => setDialogOpen(true)}>다이얼로그 열기</Button>
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="예약 확인"
          description="아래 내용으로 PT 예약을 신청하시겠습니까?"
        >
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex justify-between py-2 border-b border-white/[0.08]">
              <span className="text-slate-400">트레이너</span>
              <span>김트레이너</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/[0.08]">
              <span className="text-slate-400">일시</span>
              <span>2026년 4월 10일 오전 10:00</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>취소</Button>
            <Button onClick={() => { setDialogOpen(false); toast.success("예약 신청 완료!"); }}>
              신청하기
            </Button>
          </DialogFooter>
        </Dialog>
      </Section>

      {/* ── DataTable ── */}
      <Section title="DataTable">
        <DataTable data={sampleData} columns={sampleColumns} pageSize={3} />
      </Section>

      {/* ── Profile Icon ── */}
      <Section title="Icons (Lucide)">
        <Row>
          <User className="w-5 h-5 text-slate-400" />
          <Search className="w-5 h-5 text-emerald-400" />
          <Eye className="w-5 h-5 text-white" />
        </Row>
      </Section>
    </div>
  );
}

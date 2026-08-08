import { Button, Space } from "antd";
import { DeleteOutlined, DownloadOutlined } from "@ant-design/icons";
import { useTheme } from "@/app/theme-context";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onClearTable?: () => void;
  onExportRanking?: () => void;
  isClearing?: boolean;
  isExporting?: boolean;
}

export function PageHeader({ 
  title, 
  subtitle, 
  onClearTable, 
  onExportRanking,
  isClearing, 
  isExporting 
}: PageHeaderProps) {
  const { isDark } = useTheme();

  return (
    <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <h1 style={{ margin: "0 0 8px 0", fontSize: 28, fontWeight: 700, color: isDark ? "#fff" : "#000" }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: 0, fontSize: 14, color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.45)" }}>
            {subtitle}
          </p>
        )}
      </div>
      <Space>
        {onExportRanking && (
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={onExportRanking}
            loading={isExporting}
          >
            Generuj ranking TXT
          </Button>
        )}
        {onClearTable && (
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={onClearTable}
            loading={isClearing}
          >
            Wyczyść tabelę
          </Button>
        )}
      </Space>
    </div>
  );
}
"use client";

import { useExportPokerNk } from "./useExportPokerNk";
import { useState } from "react";
import { App, Upload, Typography, Card, Table, Button, Tag, Row, Col, Empty } from "antd";
import { DownloadOutlined, PlayCircleOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";

import type { PokerNkPayload, PokerNkPlayer } from "@/types/pokerNk";
import {
    evaluatePokerNk,
    type PokerNkEvaluatedPlayer,
    type PokerHandRank,
} from "@/logic/pokerNkLogic";

const { Title, Text } = Typography;

function isPokerNkPayload(value: unknown): value is PokerNkPayload {
    if (!Array.isArray(value)) return false;

    return value.every((row): row is PokerNkPlayer => {
        if (typeof row !== "object" || row === null) return false;
        const r = row as Record<string, unknown>;
        return (
            typeof r.Player_ID === "number" &&
            typeof r.Player === "string" &&
            typeof r.Actions === "number" &&
            typeof r.Progress === "number"
        );
    });
}

const HAND_LABEL: Record<PokerHandRank, string> = {
    Kareta: "Kareta",
    Full: "Full",
    Strit: "Strit",
    Trojka: "Trójka",
    DwiePary: "Dwie Pary",
};

const HAND_COLOR: Record<PokerHandRank, string> = {
    Kareta: "gold",
    Full: "purple",
    Strit: "blue",
    Trojka: "green",
    DwiePary: "geekblue",
};

function explainHand(entry: PokerNkEvaluatedPlayer): string {
    const countedDigitsStr = entry.digits.filter((d) => d !== 0).join(" ");
    const hand = entry.hand!;

    switch (hand.rank) {
        case "Kareta":
            return `Cztery cyfry ${hand.tiebreak[0]} (liczone cyfry: ${countedDigitsStr})`;
        case "Full":
            return `Trójka z ${hand.tiebreak[0]} i para z ${hand.tiebreak[1]} (liczone cyfry: ${countedDigitsStr})`;
        case "Strit":
            return `Ciąg kończący się na ${hand.tiebreak[0]} (liczone cyfry: ${countedDigitsStr})`;
        case "Trojka":
            return `Trzy cyfry ${hand.tiebreak[0]} (liczone cyfry: ${countedDigitsStr})`;
        case "DwiePary":
            return `Pary ${hand.tiebreak[0]} i ${hand.tiebreak[1]} (liczone cyfry: ${countedDigitsStr})`;
        default:
            return countedDigitsStr;
    }
}

export default function GeneratePokerNkByFile() {
    const { message } = App.useApp();
    const { exportResults } = useExportPokerNk();

    const [fileContent, setFileContent] = useState<string>("");
    const [jsonData, setJsonData] = useState<PokerNkPayload | null>(null);
    const [fileName, setFileName] = useState<string>("file.json");

    const [results, setResults] = useState<PokerNkEvaluatedPlayer[] | null>(null);
    const [processing, setProcessing] = useState(false);

    const isValidJson = jsonData !== null;

    const props: UploadProps = {
        beforeUpload: (file) => {
            const isText =
                file.type === "application/json" ||
                file.name.endsWith(".json") ||
                file.name.endsWith(".txt");

            if (!isText) {
                message.error("Only .json or .txt files are allowed");
                return Upload.LIST_IGNORE;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                const content = e.target?.result as string;

                let parsed: unknown;
                try {
                    parsed = JSON.parse(content);
                } catch {
                    message.error("Invalid JSON file");
                    setJsonData(null);
                    setFileContent("");
                    setResults(null);
                    return;
                }

                if (!isPokerNkPayload(parsed)) {
                    message.error(
                        "JSON is valid but doesn't match the expected Poker NK shape " +
                            "(array of { Player_ID, Player, Actions, Progress })"
                    );
                    setJsonData(null);
                    setFileContent(content);
                    setFileName(file.name);
                    setResults(null);
                    return;
                }

                setJsonData(parsed);
                setFileContent(content);
                setFileName(file.name);
                setResults(null);
                message.success(`Loaded ${parsed.length} player rows`);
            };

            reader.onerror = () => {
                message.error("Failed to read file");
            };

            reader.readAsText(file);

            return false;
        },
        showUploadList: true,
        maxCount: 1,
    };

    const handleProcess = () => {
        if (!jsonData) {
            message.error("No valid JSON loaded");
            return;
        }

        setProcessing(true);
        try {
            const evaluated = evaluatePokerNk(jsonData);
            setResults(evaluated);

            if (evaluated.length === 0) {
                message.warning("No player qualified with a hand");
            } else {
                message.success(`Processed — winner: ${evaluated[0].player.Player}`);
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleExport = () => exportResults(results);

    const resultColumns = [
        {
            title: "#",
            key: "place",
            width: 60,
            render: (_: unknown, __: PokerNkEvaluatedPlayer, index: number) => index + 1,
        },
        {
            title: "Player",
            dataIndex: ["player", "Player"],
            key: "Player",
        },
        {
            title: "Actions",
            dataIndex: ["player", "Actions"],
            key: "Actions",
            render: (val: number) => val.toLocaleString("pl-PL"),
        },
        {
            title: "Układ",
            key: "rank",
            render: (_: unknown, entry: PokerNkEvaluatedPlayer) => (
                <Tag color={HAND_COLOR[entry.hand!.rank]}>{HAND_LABEL[entry.hand!.rank]}</Tag>
            ),
        },
        {
            title: "Uzasadnienie",
            key: "explanation",
            render: (_: unknown, entry: PokerNkEvaluatedPlayer) => (
                <Text type="secondary">{explainHand(entry)}</Text>
            ),
        },
    ];

    return (
        <main style={{ padding: 24 }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                <Col>
                    <Title level={3} style={{ margin: 0 }}>
                        Poker NK
                    </Title>
                </Col>
                <Col>
                    <Button icon={<DownloadOutlined />} onClick={handleExport} disabled={!results || results.length === 0}>
                        Export to file
                    </Button>
                </Col>
            </Row>

            <Row gutter={24}>
                <Col span={12}>
                    <Card title="File preview" style={{ height: "100%" }}>
                        <Upload {...props}>
                            <Button>Upload file</Button>
                        </Upload>

                        {fileContent && (
                            <div style={{ marginTop: 16 }}>
                                <Text type={isValidJson ? "success" : "danger"}>
                                    {isValidJson
                                        ? `Valid Poker NK JSON — ${jsonData!.length} rows (${fileName})`
                                        : `File loaded but not a valid Poker NK payload (${fileName})`}
                                </Text>

                                {isValidJson && (
                                    <Table
                                        style={{ marginTop: 16 }}
                                        size="small"
                                        rowKey="Player_ID"
                                        dataSource={jsonData!}
                                        columns={[
                                            { title: "Player ID", dataIndex: "Player_ID", key: "Player_ID" },
                                            { title: "Player", dataIndex: "Player", key: "Player" },
                                            { title: "Actions", dataIndex: "Actions", key: "Actions" },
                                            { title: "Progress", dataIndex: "Progress", key: "Progress" },
                                        ]}
                                        pagination={{ pageSize: 10 }}
                                    />
                                )}
                            </div>
                        )}
                    </Card>
                </Col>

                <Col span={12}>
                    <Card
                        title="Poker Result"
                        extra={
                            <Button
                                type="primary"
                                icon={<PlayCircleOutlined />}
                                onClick={handleProcess}
                                disabled={!isValidJson}
                                loading={processing}
                            >
                                Process Poker
                            </Button>
                        }
                        style={{ height: "100%" }}
                    >
                        {results === null && (
                            <Empty description="Upload a file and click Process Poker" />
                        )}

                        {results !== null && results.length === 0 && (
                            <Empty description="No player qualified with a hand" />
                        )}

                        {results !== null && results.length > 0 && (
                            <Table
                                size="small"
                                rowKey={(entry) => entry.player.Player_ID}
                                dataSource={results}
                                columns={resultColumns}
                                pagination={{ pageSize: 10 }}
                            />
                        )}
                    </Card>
                </Col>
            </Row>
        </main>
    );
}
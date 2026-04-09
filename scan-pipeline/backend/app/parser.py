import re


def parse_findings(tool: str, target: str, output: str) -> list[dict]:
    findings: list[dict] = []

    if tool == "nmap":
        open_ports = 0
        for line in output.splitlines():
            if "/tcp" in line and "open" in line:
                open_ports += 1
                findings.append(
                    {
                        "tool": tool,
                        "target": target,
                        "severity": "medium",
                        "title": "Port ouvert détecté",
                        "evidence": line.strip(),
                    }
                )

        if open_ports == 0:
            no_ports_evidence = "Nmap n'a pas trouvé de port TCP ouvert sur cette cible"
            if target in {"127.0.0.1", "localhost"}:
                no_ports_evidence = (
                    "Dans Docker, 127.0.0.1/localhost pointe vers le conteneur worker. "
                    "Essayez backend, postgres, redis, frontend ou leurs IP internes."
                )
            findings.append(
                {
                    "tool": tool,
                    "target": target,
                    "severity": "info",
                    "title": "Aucun port ouvert détecté",
                    "evidence": no_ports_evidence,
                }
            )

    elif tool == "nikto":
        for line in output.splitlines():
            if line.startswith("+ "):
                sev = "low"
                if "missing" in line.lower() or "x-" in line.lower():
                    sev = "medium"
                findings.append(
                    {
                        "tool": tool,
                        "target": target,
                        "severity": sev,
                        "title": "Résultat Nikto",
                        "evidence": line.strip(),
                    }
                )

    elif tool == "sqlmap":
        text = output.lower()
        if "is vulnerable" in text:
            findings.append(
                {
                    "tool": tool,
                    "target": target,
                    "severity": "high",
                    "title": "Injection SQL possible",
                    "evidence": "sqlmap a signalé un paramètre potentiellement injectable",
                }
            )
        elif (
            "not injectable" in text
            or "all tested parameters do not appear" in text
            or "all tested parameters do not seem to be injectable" in text
        ):
            findings.append(
                {
                    "tool": tool,
                    "target": target,
                    "severity": "info",
                    "title": "Aucune injection SQL détectée",
                    "evidence": "sqlmap n'a trouvé aucun paramètre injectable sur cette URL. Testez une URL dynamique avec paramètre GET/POST.",
                }
            )
        elif "page not found (404)" in text:
            findings.append(
                {
                    "tool": tool,
                    "target": target,
                    "severity": "info",
                    "title": "Cible introuvable (404)",
                    "evidence": "L'URL testée renvoie 404. Utilisez une URL existante, idéalement avec un paramètre GET.",
                }
            )
        elif "403 (forbidden)" in text:
            findings.append(
                {
                    "tool": tool,
                    "target": target,
                    "severity": "info",
                    "title": "Accès refusé (403)",
                    "evidence": "La cible refuse l'accès. Vérifiez les droits/headers requis.",
                }
            )
        elif "500 (internal server error)" in text:
            findings.append(
                {
                    "tool": tool,
                    "target": target,
                    "severity": "medium",
                    "title": "Erreur serveur détectée (500)",
                    "evidence": "La cible retourne une erreur interne pendant le test sqlmap.",
                }
            )
        elif (
            "you have not declared any get and/or post parameters" in text
            or "no parameter(s) found for testing" in text
            or "provided data does not contain any parameters" in text
        ):
            findings.append(
                {
                    "tool": tool,
                    "target": target,
                    "severity": "info",
                    "title": "Aucun paramètre injectable à tester",
                    "evidence": "sqlmap nécessite des paramètres GET/POST (ex: ?id=1). Exemple local: /api/v1/labs/sql-injection?name=test",
                }
            )

    elif tool == "trivy":
        pattern = re.compile(r"\b(CRITICAL|HIGH|MEDIUM|LOW)\b")
        for line in output.splitlines():
            match = pattern.search(line)
            if match:
                sev = match.group(1).lower()
                findings.append(
                    {
                        "tool": tool,
                        "target": target,
                        "severity": sev,
                        "title": "Vulnérabilité Trivy",
                        "evidence": line.strip(),
                    }
                )

    if not findings:
        findings.append(
            {
                "tool": tool,
                "target": target,
                "severity": "info",
                "title": "Aucun résultat structuré",
                "evidence": "L'outil a terminé mais aucun résultat exploitable n'a été parsé",
            }
        )

    return findings

import * as os from 'os';

export module Util {
    /**
     * Useful for generating random contact identifiers
     * for people we don't have in our phones contact list.
     */
    export function generateRandomId(): string {
        return Math.random().toString(36).substring(2)
            + (new Date()).getTime().toString(36);
    }

    export interface HostInfo {
        ipAddress: string;
        port: number;
    }

    export function getHostingIpAddress(): HostInfo {
        let networkInterfaces = os.networkInterfaces();
        let hosts: HostInfo[] = [];

        for (let iface in networkInterfaces) {
            let x = networkInterfaces[iface];
            for (let i = 0; i < x.length; i++) {
                let element = x[i];
                if (element.address.startsWith('192')) {
                    hosts.push({
                        ipAddress: element.address,
                        port: 7102
                    });
                }
            }
        }

        if (hosts.length === 0) {
            throw new Error('Unable to a host...');
        }

        if (hosts.length === 1) {
            return hosts[0];
        }

        if (hosts.length > 1) {
            for (let host of hosts) {
                if (host.ipAddress.startsWith('192.168.1')) {
                    return host;
                }
            }
        }

        hosts.sort();
        return hosts[0];
    }
}
import { logError } from "./error-utils"

// Enum for metric types
export enum MetricType {
  COUNTER = "counter",
  GAUGE = "gauge",
  HISTOGRAM = "histogram",
}

// Interface for metric options
interface MetricOptions {
  name: string
  type: MetricType
  description?: string
  labels?: Record<string, string>
}

// Class for tracking metrics
class Metrics {
  private metrics: Map<string, any> = new Map()

  // Initialize metrics
  constructor() {
    // Initialize default metrics
    this.createCounter("http_requests_total", "Total number of HTTP requests")
    this.createCounter("http_request_errors_total", "Total number of HTTP request errors")
    this.createHistogram("http_request_duration_seconds", "HTTP request duration in seconds")
    this.createCounter("database_queries_total", "Total number of database queries")
    this.createHistogram("database_query_duration_seconds", "Database query duration in seconds")
  }

  // Create a counter metric
  createCounter(name: string, description?: string, labels?: Record<string, string>): void {
    this.metrics.set(name, {
      type: MetricType.COUNTER,
      description,
      labels,
      value: 0,
    })
  }

  // Increment a counter metric
  incrementCounter(name: string, value = 1, labels?: Record<string, string>): void {
    try {
      const metric = this.metrics.get(name)

      if (!metric || metric.type !== MetricType.COUNTER) {
        console.error(`Metric ${name} is not a counter`)
        return
      }

      metric.value += value

      // In a real application, you would send this to a metrics collection service
      // console.log(`Metric ${name} incremented by ${value}:`, metric)
    } catch (error) {
      logError(error, "INCREMENT_COUNTER")
    }
  }

  // Create a gauge metric
  createGauge(name: string, description?: string, labels?: Record<string, string>): void {
    this.metrics.set(name, {
      type: MetricType.GAUGE,
      description,
      labels,
      value: 0,
    })
  }

  // Set a gauge metric
  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    try {
      const metric = this.metrics.get(name)

      if (!metric || metric.type !== MetricType.GAUGE) {
        console.error(`Metric ${name} is not a gauge`)
        return
      }

      metric.value = value

      // In a real application, you would send this to a metrics collection service
      // console.log(`Metric ${name} set to ${value}:`, metric)
    } catch (error) {
      logError(error, "SET_GAUGE")
    }
  }

  // Create a histogram metric
  createHistogram(
    name: string,
    description?: string,
    labels?: Record<string, string>,
    buckets: number[] = [0.01, 0.05, 0.1, 0.5, 1, 5, 10],
  ): void {
    this.metrics.set(name, {
      type: MetricType.HISTOGRAM,
      description,
      labels,
      buckets,
      values: [],
    })
  }

  // Observe a value for a histogram metric
  observeHistogram(name: string, value: number, labels?: Record<string, string>): void {
    try {
      const metric = this.metrics.get(name)

      if (!metric || metric.type !== MetricType.HISTOGRAM) {
        console.error(`Metric ${name} is not a histogram`)
        return
      }

      metric.values.push(value)

      // In a real application, you would send this to a metrics collection service
      // console.log(`Metric ${name} observed ${value}:`, metric)
    } catch (error) {
      logError(error, "OBSERVE_HISTOGRAM")
    }
  }

  // Get all metrics
  getAllMetrics(): Record<string, any> {
    const result: Record<string, any> = {}

    for (const [name, metric] of this.metrics.entries()) {
      result[name] = { ...metric }
    }

    return result
  }

  // Reset all metrics
  resetAllMetrics(): void {
    for (const metric of this.metrics.values()) {
      if (metric.type === MetricType.COUNTER || metric.type === MetricType.GAUGE) {
        metric.value = 0
      } else if (metric.type === MetricType.HISTOGRAM) {
        metric.values = []
      }
    }
  }
}

// Singleton instance
export const metrics = new Metrics()

// Function to time a function execution and record it as a histogram
export async function timeFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now()

  try {
    return await fn()
  } finally {
    const duration = (performance.now() - start) / 1000 // Convert to seconds
    metrics.observeHistogram(name, duration)
  }
}

// Function to time a database query and record it as a histogram
export async function timeDbQuery<T>(fn: () => Promise<T>): Promise<T> {
  metrics.incrementCounter("database_queries_total")
  return timeFunction("database_query_duration_seconds", fn)
}

